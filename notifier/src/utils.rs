use futures::TryStreamExt;
use indexmap::{IndexMap, IndexSet};

use chrono::{DateTime, FixedOffset, NaiveDate};
use log::debug;
use mongodb::bson::doc;
use serde::Deserialize;
use teloxide::{prelude::*, types::{InlineKeyboardButton, InlineKeyboardMarkup, Message, ParseMode}, utils::html::bold, Bot};

use crate::{constants::CLIENT, error::Error, model::{AppointmentTable, Slot}};

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum SupportedCountries {
    Ch,
    Be,
    De,
    Fr,
}

impl SupportedCountries {
    pub fn create_kb(custom_pre: Option<&str>) -> InlineKeyboardMarkup {
        let mut kb = vec![];

        for c in Self::iterator() {
            let cbd = if let Some(pre) = custom_pre {
                c.to_code_with_prefix(pre)
            } else {
                c.to_code()
            };
            let row = vec![InlineKeyboardButton::callback(c.to_text(), cbd)];
            kb.push(row);
        }
        InlineKeyboardMarkup::new(kb)
    }

    pub fn iterator() -> impl Iterator<Item = SupportedCountries> {
        [Self::Be, Self::De, Self::Fr, Self::Ch].iter().copied()
    }

    pub fn to_text(self) -> String {
        match &self {
            Self::Ch => "🇨🇭 Switzerland".to_owned(),
            Self::Be => "🇧🇪 Belgium".to_owned(),
            Self::De => "🇩🇪 Germany".to_owned(),
            Self::Fr => "🇫🇷 France".to_owned()
        }
    }

    pub fn to_code(self) -> String {
        match &self {
            Self::Ch => String::from("ch"),
            Self::Be => String::from("be"),
            Self::De => String::from("de"),
            Self::Fr => String::from("fr"),
        }
    }

    pub fn to_code_with_prefix(self, prefix: &str) -> String {
        let mut code = String::from(prefix);
        code.push_str(&self.to_code());
        code
    }

    pub fn from_code(input: &str) -> Option<Self> {
        match input {
            "ch" => Some(Self::Ch),
            "be" => Some(Self::Be),
            "de" => Some(Self::De),
            "fr" => Some(Self::Fr),
            _ => None
        }
    }

    pub fn from_code_with_prefix(input: &str, prefix: &str) -> Option<Self> {
        let code = input.strip_prefix(prefix).unwrap_or_default();
        Self::from_code(code)
    }
    
}

#[derive(Clone, Copy, Debug)]
pub enum GBSupportedCenters {
    Lon,  // London
    Edi,  // Edinburgh
    Mnc,  // Manchester
}

impl GBSupportedCenters {
    pub fn iterator() -> impl Iterator<Item = Self> {
        [Self::Lon, Self::Edi, Self::Mnc].iter().copied()
    }

    pub fn to_kb(to_country: &str, custom_pre: Option<&str>) -> InlineKeyboardMarkup {
        let mut kb = vec![];
        for c in Self::iterator() {
            let cbd = if let Some(prefix) = custom_pre {
                c.to_code_with_prefix(to_country, prefix)
            } else {
                c.to_code(to_country)
            };
            let row = vec![InlineKeyboardButton::callback(c.to_text(), cbd)];
            kb.push(row)
        }
        InlineKeyboardMarkup::new(kb)
    }

    pub fn to_text(self) -> String {
        match self {
            Self::Lon => String::from("London"),
            Self::Edi => String::from("Edinburgh"),
            Self::Mnc => String::from("Manchester"),
        }
    }

    pub fn to_code(self, to_country: &str) -> String {
        match &self {
            Self::Lon => format!("gbLON2{to_country}"),
            Self::Edi => format!("gbEDI2{to_country}"),
            Self::Mnc => format!("gbMNC2{to_country}"),
        }
    }

    pub fn to_code_with_prefix(self, to_country: &str, prefix: &str) -> String {
        let mut code = String::from(prefix);
        code.push_str(&self.to_code(to_country));
        code
    }

    pub fn from_code(cbd: &str) -> (Option<Self>, Option<SupportedCountries>) {
        let cnty = &cbd[cbd.len()-2..cbd.len()];
        match cbd[0..cbd.len()-2].to_lowercase().as_str() {
            "gblon2" => (Some(Self::Lon), SupportedCountries::from_code(cnty)),
            "gbedi2" => (Some(Self::Edi), SupportedCountries::from_code(cnty)),
            "gbmnc2" => (Some(Self::Mnc), SupportedCountries::from_code(cnty)),
            _ => (None, None)
        }
    }

    pub fn from_code_with_prefix(cbd: &str, prefix: &str) -> (Option<Self>, Option<SupportedCountries>) {
        let code = cbd.strip_prefix(prefix).unwrap_or_default();
        Self::from_code(code)
    }

}

type AptTable = IndexMap<String, IndexSet<Slot>>;

pub fn compute_diff<'a>(new: &'a AptTable, old: &'a AptTable) -> (Option<AptTable>, Option<AptTable>) {
    let mut added: AptTable = IndexMap::new();
    let mut removed: AptTable = IndexMap::new();

    for (key, value) in old {
        if !new.contains_key(key) {
            removed.insert(key.clone(), value.clone());
        }
    }

    for (key, value) in new {
        if let Some(old_value) = old.get(key) {
            if value != old_value {
                let updated_removed = old_value.difference(value)
                    .cloned()
                    .collect::<IndexSet<_>>();
                if !updated_removed.is_empty() {
                    removed.insert(key.clone(), updated_removed);
                }

                let updated_added = value.difference(old_value)
                    .cloned()
                    .collect::<IndexSet<_>>();
                if !updated_added.is_empty() {
                    added.insert(key.clone(), updated_added);
                }
            }
        } else {
            added.insert(key.clone(), value.clone());
        }
    }

    (
        if !added.is_empty() { Some(added) } else { None },
        if !removed.is_empty() { Some(removed) } else { None }
    )
}

impl AppointmentTable {
    pub fn to_text(&self, latest: bool) -> String {
        if let (Some(center), Some(country)) = GBSupportedCenters::from_code(&self.center)  {
            // Latest Table for <country>(<center>)
            // (last updated at: <>)
            let mut msgbuilder = String::new();
            msgbuilder.push_str(if latest { "Latest Table for " } else { "Updated Table for" });
            msgbuilder.push_str(&bold(&country.to_text()));
            msgbuilder.push_str(" (");
            msgbuilder.push_str(&bold(&center.to_text()));
            msgbuilder.push_str(")\n");

            let dt = DateTime::parse_from_rfc3339(
                &self.id.unwrap().timestamp()
                    .try_to_rfc3339_string()
                    .unwrap()
            )
                .unwrap();

            let tz = FixedOffset::east_opt((5 * 60 * 60) + (30 * 60));
            if let Some(tz) = tz {
                msgbuilder.push_str("last updated at: ");
                let dtfmt = dt.with_timezone(&tz).format("%d/%m/%Y %H:%M");
                msgbuilder.push_str(&format!("{}\n\n", dtfmt));
                if self.slots_available.is_empty() {
                    msgbuilder.push_str("No slots available right now.");
                } else {
                    msgbuilder.push_str(&Self::__proto_build(&self.slots_available));
                }
            }
            msgbuilder
        } else {
            String::from("Unsupported country/center")
        }
    }

    fn __proto_build(s: &IndexMap<String, IndexSet<Slot>>) -> String {
        let mut msgbuilder = String::new();
        for (date, slots) in s {
            let dt = NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap();
            msgbuilder.push_str(&bold(&format!("{}\n", dt.format("%d/%m/%Y"))));
            for slots in slots {
                let slot_type = match slots._type.as_str() {
                    "normal" => "Normal",
                    "pma" => "Prime Time",
                    "pmwa" => "Prime Time Weekend",
                    "Short_stay" => "Short Stay",
                    _ => &slots._type,
                };
                msgbuilder.push_str(&format!("    {}: {}\n", slots.td, slot_type));
            }
            msgbuilder.push('\n');
        }
        msgbuilder
    }

    pub fn to_text_from_diff(
        center: GBSupportedCenters,
        country: SupportedCountries,
        added: &IndexMap<String, IndexSet<Slot>>, 
        // _: &IndexMap<String, IndexSet<Slot>>
    ) -> String {
        let mut msgbuilder = String::new();
        msgbuilder.push_str("Newly Updated Table for ");
        msgbuilder.push_str(&bold(&country.to_text()));
        msgbuilder.push_str(" (");
        msgbuilder.push_str(&bold(&center.to_text()));
        msgbuilder.push_str(")\n\n");

        msgbuilder.push_str(&Self::__proto_build(added));

        msgbuilder
    }
}

pub async fn send_latest_table(bot: Bot, msg: Message, center: GBSupportedCenters, country: SupportedCountries, edit: bool) -> Result<(), Error> {
    debug!("sending latest table");
    let db = CLIENT.get().await
        .database("aspint")
        .collection::<AppointmentTable>("appointment_table");
    debug!("fetching current table");
    let curr_table = db.find(doc! { "center": center.to_code(&country.to_code()) })
        .sort(doc! { "_id": -1 })
        .await?
        .try_collect::<Vec<_>>()
        .await?;
    if let Some(table) = curr_table.first() {
        debug!("found latest table");
        let t_text = table.to_text(true);
        
        if edit {
            bot.edit_message_text(msg.chat.id, msg.id, t_text)
                .parse_mode(ParseMode::Html)
                .await?;
        } else {
            bot.send_message(msg.chat.id, t_text).parse_mode(ParseMode::Html).await?;
        }
    } else if edit {
        bot.edit_message_text(msg.chat.id, msg.id, "No data found.")
            .parse_mode(ParseMode::Html)
            .await?;
    } else {
        bot.send_message(msg.chat.id, "No data found").parse_mode(ParseMode::Html).await?;
    }
    Ok(())
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff() {
        let mut old_slot: AptTable = IndexMap::new();
        let slot = [
            Slot { td: "08:30".into(), _type: "normal".into() },
            Slot { td: "09:30".into(), _type: "normal".into() },
            Slot { td: "10:30".into(), _type: "normal".into() },
            Slot { td: "11:30".into(), _type: "normal".into() },
            Slot { td: "12:30".into(), _type: "normal".into() },
            Slot { td: "13:30".into(), _type: "normal".into() },
        ];
        old_slot.insert("01-01-0001".into(), IndexSet::from(slot.clone()));
        old_slot.insert("02-01-0001".into(), IndexSet::from(slot.clone()));

        let slot2 = [
            Slot { td: "10:30".into(), _type: "normal".into() },
            Slot { td: "11:30".into(), _type: "normal".into() },
            Slot { td: "14:30".into(), _type: "normal".into() },
        ];
        
        let mut new_slot: AptTable = IndexMap::new();
        new_slot.insert("02-01-0001".into(), IndexSet::from(slot2));

        let (added, removed) = compute_diff(&new_slot, &old_slot);
        println!("a: {:?}, b: {:?}", added, removed);
    }

    #[test]
    fn test_diff2() {
        let old_slot: AptTable = IndexMap::new();

        let slot2 = [
            Slot { td: "10:30".into(), _type: "normal".into() },
            Slot { td: "11:30".into(), _type: "normal".into() },
            Slot { td: "14:30".into(), _type: "normal".into() },
        ];
        
        let mut new_slot: AptTable = IndexMap::new();
        new_slot.insert("02-01-0001".into(), IndexSet::from(slot2));

        let (added, removed) = compute_diff(&new_slot, &old_slot);
        println!("a: {:?}, b: {:?}", added, removed);
    }
}
