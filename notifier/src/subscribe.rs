use futures::TryStreamExt;
use log::debug;
use mongodb::bson::doc;
use teloxide::{prelude::*, types::{Message, ParseMode}, Bot};

use crate::{constants::{CLIENT, NOTIFIER_SUB_COL}, error::Error, model::{AppointmentTable, NotifierSubCol}, utils::{GBSupportedCenters, SupportedCountries}};

pub async fn new_subscribe_cmd_handler(msg: Message, bot: Bot) -> Result<(), Error> {
    bot.send_message(msg.chat.id, "Choose country:")
        .reply_markup(SupportedCountries::create_kb())
        .await?;
    Ok(())
}

async fn send_latest_table(bot: Bot, msg: Message, center: GBSupportedCenters, country: SupportedCountries) -> Result<(), Error> {
    debug!("sending latest table");
    let db = CLIENT.get().await
        .database("aspint")
        .collection::<AppointmentTable>("appointment_table");
    debug!("fetching current table");
    let curr_table = db.find(doc! { "center": center.to_callback_data(&country.to_callback_data()) })
        .sort(doc! { "_id": -1 })
        .await?
        .try_collect::<Vec<_>>()
        .await?;
    if let Some(table) = curr_table.first() {
        debug!("found latest table");
        let t_text = table.to_text(true);
        bot.send_message(msg.chat.id, t_text).parse_mode(ParseMode::Html).await?;
    }
    Ok(())
}

pub async fn subscribe_callback_handler(bot: Bot, cq: CallbackQuery) -> Result<(), Error> {
    debug!("subscribe callback handler...");
    bot.answer_callback_query(&cq.id).await?;
    if let Some(data) = cq.data { 
        debug!("Got data: {}", data);
        if let Some(country) = SupportedCountries::from_callback_data(&data) {
            debug!("identified as 'select country' callback.");
            if let Some(msg) = cq.message {
                debug!("updating messaging to give center selection option");
                bot.edit_message_text(msg.chat.id, msg.id, "Select center: ").await?;
                bot.edit_message_reply_markup(msg.chat.id, msg.id)
                    .reply_markup(GBSupportedCenters::to_kb(&country.to_callback_data()))
                    .await?;
            }
        } else if let (Some(center), Some(country)) = GBSupportedCenters::extract_cbd(&data) {
            debug!("identified as 'select center' callback.");
            if let Some(msg) = cq.message {
                debug!("checking user subscribe data");
                let db = CLIENT.get().await
                    .database("aspint")
                    .collection::<NotifierSubCol>(NOTIFIER_SUB_COL);
                let user = db.find_one(doc! { "chat_id": msg.chat.id.0})
                    .await?;
                if let Some(d) = user {
                    debug!("user already have entry in database. checking for duplicate subscribe action.");
                    if d.sub_centers.contains(&center.to_callback_data(&country.to_callback_data())) {
                        debug!("user already subscribed to same center of country.");
                        bot.edit_message_text(
                            msg.chat.id,
                            msg.id,
                            format!(
                                "You're already subscribed to <b>{}</b - <b>{}</b>", 
                                country.to_text(),
                                center.to_text(),
                            )
                        )
                            .parse_mode(ParseMode::Html)
                            .await?;
                    } else {
                        debug!("user not subscribed to chosen center, inserting updated info to database.");
                        let filter = doc! { "_id": d.id.unwrap() };
                        let update = doc! { "$push": doc! { "sub_centers": center.to_callback_data(&country.to_callback_data()) } };
                        db.update_one(filter, update).await?;
                        bot.edit_message_text(
                            msg.chat.id, 
                            msg.id,
                            format!("Subscribed to <b>{}</b> - <b>{}</b>", country.to_text(), center.to_text())
                        )
                            .parse_mode(ParseMode::Html)
                            .await?;
                        send_latest_table(bot, msg, center, country).await?;
                    }
                } else {
                    debug!("User doesnot have entry in db, creating new one.");
                    // new user
                    let d = NotifierSubCol {
                        id: None,
                        chat_id: msg.chat.id.0,
                        is_subscribed: true,
                        sub_centers: vec![center.to_callback_data(&country.to_callback_data())]
                    };
                    db.insert_one(&d).await?;
                    bot.edit_message_text(
                        msg.chat.id, 
                        msg.id,
                        format!("Subscribed to <b>{}</b> - <b>{}</b>", country.to_text(), center.to_text())
                    )
                        .parse_mode(ParseMode::Html)
                        .await?;
                    send_latest_table(bot, msg, center, country).await?;
                }
            }
        } else if data.starts_with("latest_") {
            if let (Some(center), Some(country)) = GBSupportedCenters::extract_cbd(&data) {
                if let Some(msg) = cq.message {
                    send_latest_table(bot, msg, center, country).await?
                }
            }
        } else { debug!("Unknown callback data. Ignoring"); }
    }
    Ok(())
}
