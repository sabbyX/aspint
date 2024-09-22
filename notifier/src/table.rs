use log::debug;
use teloxide::{prelude::*, types::Message, Bot};

use crate::{error::Error, utils::{send_latest_table, GBSupportedCenters, SupportedCountries}};

const TABLE_CQ_PRE: &str = "table_";

pub async fn table_cmd_handler(msg: Message, bot: Bot) -> Result<(), Error> {
    bot.send_message(msg.chat.id, "Choose:")
        .reply_markup(SupportedCountries::create_kb(Some(TABLE_CQ_PRE)))
        .await?;
    Ok(())
}

pub async fn table_callback_query(bot: Bot, cq: CallbackQuery) -> Result<(), Error> {
    debug!("table callback handler ...");
    bot.answer_callback_query(cq.id).await?;
    let data = cq.data;
    if let Some(cq_data) = data {
        debug!("table callback");
        if cq_data.starts_with(TABLE_CQ_PRE) {
            if let Some(country) = SupportedCountries::from_code_with_prefix(&cq_data, TABLE_CQ_PRE) {
                if let Some(message) = cq.message {
                    debug!("updating message to give center option");
                    bot.edit_message_reply_markup(message.chat.id, message.id)
                        .reply_markup(GBSupportedCenters::to_kb(&country.to_code(), Some(TABLE_CQ_PRE)))
                        .await?;
                }
            } else if let (Some(center), Some(country)) = GBSupportedCenters::from_code_with_prefix(&cq_data, TABLE_CQ_PRE) {
                if let Some(message) = cq.message {
                    send_latest_table(bot, message, center, country, true).await?;
                }
            }
        }
    }
    Ok(())
}
