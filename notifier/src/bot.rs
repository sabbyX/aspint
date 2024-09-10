use std::time::Duration;
use futures::{StreamExt, TryFutureExt, TryStreamExt};
use lazy_static::lazy_static;
use async_once::AsyncOnce;
use mongodb::{bson::doc, change_stream::event::OperationType, Client};
use crate::{error::Error, model::{AppointmentTable, NotifierSubCol}, utils::compute_diff};

use teloxide::{dispatching::dialogue::GetChatId, prelude::*, utils::command::BotCommands};
use log::{debug, error, info};

const NOTIFIER_SUB_COL: &str = "notifier_subs";

lazy_static! {
    static ref CLIENT: AsyncOnce<Client> = AsyncOnce::new(async {
        let uri = "mongodb://user:psw@127.0.0.1:27017/?directConnection=true";
        Client::with_uri_str(&uri).await.unwrap()
    });
}

#[derive(BotCommands, Clone)]
#[command(description = "Commands:", rename_rule = "lowercase")]
pub enum Command {
    #[command(description = "start")]
    Start,
    #[command(description = "Subscribe to slot notifications")]
    Subscribe,
}

async fn poll_changes(client: &Client, bot: Bot) -> Result<(), Error> {
    debug!("Init poll_changes");
    let watch_col = client.database("aspint").collection::<AppointmentTable>("appointment_table");

    let mut change_stream = watch_col.watch().await?;
    debug!("listening");
    while let Some(event) = change_stream.next().await.transpose()? {
        debug!("new event {:?}", event);
        let mut msg_builder = String::new();
        
        if event.operation_type == OperationType::Insert {
            debug!("event operation is insert. starting the validation");
            let document = event.full_document.unwrap();
            let older_doc_cursor = watch_col
                .find(doc! {"issuer": &document.issuer, "center": &document.center})
                .sort(doc! {"_id": -1})
                .await?;
            let docs: Vec<AppointmentTable> = older_doc_cursor.try_collect().await?;
            if docs.len() > 2 {
                error!("unexpected database structure, expected 2, but got {}",docs.len());
                continue;
            } else if docs.len() < 2 && !&docs[0].slots_available.is_empty() {
                msg_builder.push_str("added\n");
                let tm = format!(
                    "country: {}, center: {}\n", &document.issuer, &document.center
                );
                msg_builder.push_str(&tm);
                for (key, value) in &docs[0].slots_available {
                    msg_builder.push_str(key);
                    for slot in value {
                        let tm = format!("    {} - {}\n", &slot.td, &slot._type);
                        msg_builder.push_str(&tm);
                    }
                }
            } else {
                let older_one = docs[1].clone();

                let new_slots = document.slots_available;
                let old_slots = older_one.slots_available;

                debug!("older table: {:?}\n new table: {:?}", &old_slots, &new_slots);

                if new_slots.eq(&old_slots) {
                    debug!("both tables are unchanged. ignoring this event");
                    continue
                }

                debug!("computing the diff");
                let (added, removed) = compute_diff(
                    &new_slots, &old_slots
                );

                debug!("added: {:?}\nRemoved: {:?}", &added, &removed);
                debug!("creating subscriber msg");
                msg_builder.push_str("added\n");
                let tm = format!(
                    "country: {}, center: {}\n", &document.issuer, &document.center
                );
                msg_builder.push_str(&tm);
                if added.is_some() {
                    for (key, value) in new_slots {
                        msg_builder.push_str(&key);
                        for slot in value {
                            let tm = format!("    {} - {}\n", &slot.td, &slot._type);
                            msg_builder.push_str(&tm);
                        }
                    }
                } else {
                    debug!("No added slots, ignoring event");
                    continue;
                }
            }
            let mut subscribers = client.database("aspint")
                .collection::<NotifierSubCol>(NOTIFIER_SUB_COL)
                .find(doc! {})
                .await
                .map_err(Error::MongoDBError)?;

            while let Some(sub) = subscribers.try_next().await.map_err(Error::MongoDBError)? {
                if sub.is_subscribed {
                    bot.send_message(ChatId(sub.chat_id), msg_builder.clone())
                        .await
                        .map_err(Error::TeloxideError)?;
                }
                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        };
    }
    Ok(())
}

pub async fn run() {
    info!("Starting the bot");
    let bot = Bot::new("7449410586:AAFmiCOS0Fdl0X8LErvH1BTf6T1PKQRlBRQ");
    let bot2 = bot.clone();
    tokio::spawn(
        async move {
            let j = poll_changes(CLIENT.get().await, bot2).await;
            debug!("{:?}", j)
        }
    );
    
    bot.set_my_commands(Command::bot_commands())
        .await
        .expect("Failed to set bot commands");

    let handler = dptree::entry()
        .branch(
            Update::filter_message()
                .filter_command::<Command>()
                .endpoint(command_handler)
        )
        .branch(Update::filter_my_chat_member());

    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}

async fn command_handler(msg: Message, bot: Bot, cmd: Command) -> Result<(), Error>{
    match cmd {
        Command::Start => {
            bot.send_message(
                msg.chat.id,
                "I am working."
            )
                .await
                .map_err(Error::TeloxideError)?;
            Ok(())
        },
        Command::Subscribe => {
            debug!("recieved command for subscribe");
            let cmd_text = msg.text();
            if cmd_text.is_none() { return Ok(()) }
            let parsed = cmd_text.unwrap().split_whitespace().collect::<Vec<&str>>();
            debug!("rcvd command: {:?}", parsed);
            // if parsed.len() < 3 || parsed.len() > 3 {
            //     bot.send_message(
            //         msg.chat.id,
            //         format!("Expected 2 arguments, got {}", parsed.len())
            //     )
            //         .await
            //         .map_err(Error::TeloxideError)?;
            //     return Ok(());
            // }

            debug!("checking if user already subscribed");
            let db = CLIENT.get()
                .await
                .database("aspint")
                .collection::<NotifierSubCol>(NOTIFIER_SUB_COL);
            
            let res = db.find_one(doc! {"chat_id": msg.chat.id.0})
                .await?;

            debug!("db result: {:?}", res);
            if res.is_none() {
                debug!("subscribing the user");
                let doc = NotifierSubCol { chat_id: msg.chat.id.0, is_subscribed: true };
                let res = db.insert_one(doc).await;
                debug!("db result: {:?}", res);
                if res.is_ok() {
                    debug!("successfully subscribed");
                    bot.send_message(msg.chat.id, "Subscribed.")
                        .await
                        .map_err(Error::TeloxideError)?;
                } else {
                    debug!("subscribe failed");
                    bot.send_message(
                        msg.chat.id, format!("Failed to subscribe: {:?}", res.err().unwrap())
                    )
                        .await
                        .map_err(Error::TeloxideError)?;
                }
            } else {
                bot.send_message(msg.chat.id, "You're already subscribed.")
                    .await
                    .map_err(Error::TeloxideError)?;
            }
            Ok(())
        }
    }
}
