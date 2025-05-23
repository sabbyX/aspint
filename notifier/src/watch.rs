use std::time::Duration;

use futures::{StreamExt, TryStreamExt};
use log::{debug, error};
use mongodb::{bson::doc, change_stream::event::OperationType, Client};
use teloxide::{prelude::*, types::{ChatId, InlineKeyboardButton, InlineKeyboardMarkup, ParseMode}, Bot};

use crate::{constants::{NOTIFIER_RESUME_TOKEN_COL, NOTIFIER_SUB_COL}, error::Error, model::{AppointmentTable, NotifierResumeToken, NotifierSubCol}, utils::{compute_diff, GBSupportedCenters}};


pub async fn poll_changes(client: &Client, bot: Bot) -> Result<(), Error> {
    debug!("Init poll_changes");
    let watch_col = client.database("aspint").collection::<AppointmentTable>("appointment_table");

    let res = client.database("aspint")
        .collection::<NotifierResumeToken>(NOTIFIER_RESUME_TOKEN_COL)
        .find_one(doc! { "notifier": "aspint" })
        .await?
        .map(|v| v.res_token);
    let mut change_stream = watch_col.watch().resume_after(res).await?;
    debug!("listening");
    while let Some(event) = change_stream.next().await.transpose()? {
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
                error!("{}: unexpected database structure, expected 2, but got {}", &document.center, docs.len());
            } else if docs.len() < 2 && !&docs[0].slots_available.is_empty() {
                debug!("{}: Found new table, with no twin to compare, sending whole table...", &document.center);
                msg_builder.push_str(
                    &document.to_text(true)
                );
            } else {
                let older_one = docs[1].clone();

                let new_slots = document.slots_available;
                let old_slots = older_one.slots_available;

                if new_slots.eq(&old_slots) {
                    debug!("{}: both tables are unchanged. ignoring this event", &document.center);
                } else {
                    debug!("computing the diff");
                    let (added, removed) = compute_diff(
                        &new_slots, &old_slots
                    );

                    debug!("{}: added: {:?}\nRemoved: {:?}", &document.center, &added, &removed);
                    debug!("creating subscriber msg");
                    if let Some(added) = added {
                        if let (Some(center), Some(country)) = GBSupportedCenters::from_code(&document.center) {
                            msg_builder.push_str(
                                &AppointmentTable::to_text_from_diff(
                                    center, 
                                    country, 
                                    &added, 
                                )
                            )
                        }
                        let mut subscribers = client.database("aspint")
                            .collection::<NotifierSubCol>(NOTIFIER_SUB_COL)
                            .find(doc! { "sub_centers": &document.center })
                            .await?;
            
                        while let Some(sub) = subscribers.try_next().await? {
                            if sub.is_subscribed {
                                bot.send_message(ChatId(sub.chat_id), msg_builder.clone())
                                    .parse_mode(ParseMode::Html)
                                    .reply_markup(
                                        InlineKeyboardMarkup::new(
                                            vec![vec![
                                                InlineKeyboardButton::callback(
                                                    "View All", 
                                                    format!("latest_{}", &document.center)
                                                )
                                            ]]
                                        )
                                    )
                                    .await?;
                            }
                            tokio::time::sleep(Duration::from_secs(2)).await; // rate limiter
                        }
                    } else {
                        debug!("No added slots, ignoring event");
                    }
                }
            }

            debug!("saving resume token...");
            client.database("aspint")
                .collection::<NotifierResumeToken>(NOTIFIER_RESUME_TOKEN_COL)
                .find_one_and_replace(
                    doc! { "notifier": "aspint" },
                    NotifierResumeToken { notifier: String::from("aspint"), res_token: event.id }
                )
                .upsert(true)
                .await?;
        } else if event.operation_type == OperationType::Invalidate {
            // invalidate res token
            debug!("recieved invalidate event, cancelling previous resume token.");
            client.database("aspint")
                .collection::<NotifierResumeToken>(NOTIFIER_RESUME_TOKEN_COL)
                .delete_one(doc! { "notifier": "aspint" })
                .await?;
        };
    }
    Ok(())
}