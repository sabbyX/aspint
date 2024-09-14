use mongodb::bson::doc;
use crate::{constants::{AUTH_KEY, CLIENT, NOTIFIER_AUTH_COL}, error::Error, model::AuthUser, subscribe::{new_subscribe_cmd_handler, subscribe_callback_handler}, watch::poll_changes};

use teloxide::{dispatching::{dialogue::GetChatId, HandlerExt}, prelude::*, utils::command::BotCommands};
use log::{debug, error, info};

#[derive(BotCommands, Clone)]
#[command(rename_rule = "lowercase")]
pub enum GeneralCommand {
    #[command(description = "start")]
    Start,
    #[command(description = "Authenticate User")]
    Auth(String),
}

#[derive(BotCommands, Clone, Debug)]
#[command(rename_rule = "lowercase")]
pub enum AuthenticatedCommand {
    #[command(description = "Subscribe to slot notifications")]
    Subscribe,
}

pub async fn run() {
    info!("Starting the bot");
    let bot = Bot::new("7449410586:AAFmiCOS0Fdl0X8LErvH1BTf6T1PKQRlBRQ");

    // todo: update poll_changes
    let bot2 = bot.clone();
    tokio::spawn(
        async move {
            while true {  // failsafe, we dont want watcher to fail.
                info!("starting poll_changes");
                let j = poll_changes(CLIENT.get().await, bot2.clone()).await;
                error!("{:?}", j)
            }
        }
    );
    
    bot.set_my_commands(GeneralCommand::bot_commands())
        .await
        .expect("Failed to set bot commands");
    
    let handler2 = dptree::entry()
        .branch(
            Update::filter_message()
                .filter_command::<GeneralCommand>()
                .endpoint(gen_command_handler),
        )
        .branch(
                Update::filter_message()
                .filter_command::<AuthenticatedCommand>()
                .endpoint(authenticated_command_handler),
        )
        .branch(
            Update::filter_callback_query().endpoint(subscribe_callback_handler),   
        );

    Dispatcher::builder(bot, handler2)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
}

async fn gen_command_handler(msg: Message, bot: Bot, cmd: GeneralCommand) -> Result<(), Error>{
    match cmd {
        GeneralCommand::Start => {
            bot.send_message(
                msg.chat.id,
                "I am working."
            )
                .await
                .map_err(Error::TeloxideError)?;
            Ok(())
        },
        GeneralCommand::Auth(key) => {
            info!("Rcvd AUTH command");
            if key == AUTH_KEY {
                debug!("valid auth key given, init further proceeding...");
                let db = CLIENT.get()
                    .await
                    .database("aspint")
                    .collection::<AuthUser>(NOTIFIER_AUTH_COL);
                let res = db.find_one(doc! {"chat_id": msg.chat.id.0})
                    .await?;
                if res.is_some() {
                    debug!("user already authenticated. ignoring");
                    return Ok(())
                }
                let auth_doc = AuthUser { chat_id: msg.chat.id.0 };
                db.insert_one(&auth_doc)
                    .await?;
                debug!("user is added to database, authenticated.");
                bot.send_message(msg.chat.id, "Authenticated.")
                    .await?;
            }
            Ok(())
        }
    }
}

async fn authenticated_command_handler(msg: Message, bot: Bot, cmd: AuthenticatedCommand) -> Result<(), Error> {
    let auth_users = CLIENT.get().await
        .database("aspint")
        .collection::<AuthUser>(NOTIFIER_AUTH_COL);
    if auth_users.find_one(doc! { "chat_id": msg.chat.id.0 }).await.unwrap_or_default().is_none() {
        bot.send_message(msg.chat.id, "You're not authenticated.").await?;
        return Ok(())
    }
    debug!("authenicated user requesting command: {:?}", cmd);
    match cmd {
        AuthenticatedCommand::Subscribe => new_subscribe_cmd_handler(msg, bot).await,
    }
}