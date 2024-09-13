use std::time::Duration;

use futures::{StreamExt, TryStreamExt};
use log::{debug, error};
use mongodb::{bson::doc, change_stream::event::OperationType, Client};
use teloxide::{prelude::*, types::ChatId, Bot};

use crate::{error::Error, model::{AppointmentTable, NotifierSubCol}, utils::compute_diff, constants::NOTIFIER_SUB_COL};


pub async fn poll_changes(client: &Client, bot: Bot) -> Result<(), Error> {
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