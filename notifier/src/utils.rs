use std::collections::{HashMap, HashSet};

use chrono::{DateTime, FixedOffset, NaiveDate};
use log::debug;
use teloxide::{types::{InlineKeyboardButton, InlineKeyboardMarkup}, utils::html::bold};

use crate::{error::Error, model::{AppointmentTable, Slot}};

#[derive(Clone, Copy, Debug)]
pub enum SupportedCountries {
    Ch,
    Be,
    De,
}

impl SupportedCountries {
    pub fn create_kb() -> InlineKeyboardMarkup {
        let mut kb = vec![];

        for c in Self::iterator() {
            let row = vec![InlineKeyboardButton::callback(c.to_text(), c.to_callback_data())];
            kb.push(row);
        }
        InlineKeyboardMarkup::new(kb)
    }

    pub fn iterator() -> impl Iterator<Item = SupportedCountries> {
        [Self::Ch, Self::Be, Self::De].iter().copied()
    }

    pub fn to_text(self) -> String {
        match &self {
            Self::Ch => "🇨🇭 Switzerland".to_owned(),
            Self::Be => "🇧🇪 Belgium".to_owned(),
            Self::De => "🇩🇪 Germany".to_owned(),
        }
    }

    pub fn to_callback_data(self) -> String {
        match &self {
            Self::Ch => String::from("ch"),
            Self::Be => String::from("be"),
            Self::De => String::from("de"),
        }
    }

    pub fn from_callback_data(input: &str) -> Option<Self> {
        match input {
            "ch" => Some(Self::Ch),
            "be" => Some(Self::Be),
            "de" => Some(Self::De),
            _ => None
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub enum GBSupportedCenters {
    LON,  // London
    EDI,  // Edinburgh
    MNC,  // Manchester
}

impl GBSupportedCenters {
    pub fn iterator() -> impl Iterator<Item = Self> {
        [Self::LON, Self::EDI, Self::MNC].iter().copied()
    }

    pub fn to_kb(to_country: &str) -> InlineKeyboardMarkup {
        let mut kb = vec![];
        for c in Self::iterator() {
            let row = vec![InlineKeyboardButton::callback(c.to_text(), c.to_callback_data(to_country))];
            kb.push(row)
        }
        InlineKeyboardMarkup::new(kb)
    }

    pub fn to_text(self) -> String {
        match self {
            Self::LON => String::from("London"),
            Self::EDI => String::from("Edinburgh"),
            Self::MNC => String::from("Manchester"),
        }
    }

    pub fn to_callback_data(self, to_country: &str) -> String {
        match &self {
            Self::LON => format!("gbLON2{to_country}"),
            Self::EDI => format!("gbEDI2{to_country}"),
            Self::MNC => format!("gbMNC2{to_country}"),
        }
    }

    pub fn extract_cbd(cbd: &str) -> (Option<Self>, Option<SupportedCountries>) {
        let cnty = &cbd[cbd.len()-2..cbd.len()];
        match cbd[0..cbd.len()-2].to_lowercase().as_str() {
            "gblon2" => (Some(Self::LON), SupportedCountries::from_callback_data(cnty)),
            "gbedi2" => (Some(Self::EDI), SupportedCountries::from_callback_data(cnty)),
            "gbmnc2" => (Some(Self::MNC), SupportedCountries::from_callback_data(cnty)),
            _ => (None, None)
        }
    }

}

type AptTable = HashMap<String, HashSet<Slot>>;

pub fn compute_diff<'a>(new: &'a AptTable, old: &'a AptTable) -> (Option<AptTable>, Option<AptTable>) {
    let mut added: AptTable = HashMap::new();
    let mut removed: AptTable = HashMap::new();

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
                    .collect::<HashSet<_>>();
                if !updated_removed.is_empty() {
                    removed.insert(key.clone(), updated_removed);
                }

                let updated_added = value.difference(old_value)
                    .cloned()
                    .collect::<HashSet<_>>();
                if !updated_added.is_empty() {
                    added.insert(key.clone(), updated_added);
                }
            }
        }
    }

    (
        if added.len() > 0 { Some(added) } else { None },
        if removed.len() > 0 { Some(removed) } else { None }
    )
}

impl AppointmentTable {
    pub fn to_text(&self, latest: bool) -> String {
        if let (Some(center), Some(country)) = GBSupportedCenters::extract_cbd(&self.center)  {
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
                msgbuilder.push_str(&Self::__proto_build(&self.slots_available));
            }
            msgbuilder
        } else {
            String::from("Unsupported country/center")
        }
    }

    fn __proto_build(s: &HashMap<String, HashSet<Slot>>) -> String {
        let mut msgbuilder = String::new();
        for (date, slots) in s {
            let dt = NaiveDate::parse_from_str(date, "%Y-%m-%d").unwrap();
            msgbuilder.push_str(&bold(&format!("{}\n", dt.format("%d/%m/%Y"))));
            for slots in slots {
                let slot_type = match slots._type.as_str() {
                    "normal" => "Normal",
                    "pma" => "Prime Time",
                    "pmwa" => "Prime Time Weekend",
                    _ => "Unknown",
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
        added: &HashMap<String, HashSet<Slot>>, 
        // _: &HashMap<String, HashSet<Slot>>
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diff() {
        let mut old_slot: AptTable = HashMap::new();
        let slot = [
            Slot { td: "08:30".into(), _type: "normal".into() },
            Slot { td: "09:30".into(), _type: "normal".into() },
            Slot { td: "10:30".into(), _type: "normal".into() },
            Slot { td: "11:30".into(), _type: "normal".into() },
            Slot { td: "12:30".into(), _type: "normal".into() },
            Slot { td: "13:30".into(), _type: "normal".into() },
        ];
        old_slot.insert("01-01-0001".into(), HashSet::from(slot.clone()));
        old_slot.insert("02-01-0001".into(), HashSet::from(slot.clone()));

        let slot2 = [
            Slot { td: "10:30".into(), _type: "normal".into() },
            Slot { td: "11:30".into(), _type: "normal".into() },
            Slot { td: "14:30".into(), _type: "normal".into() },
        ];
        
        let mut new_slot: AptTable = HashMap::new();
        new_slot.insert("02-01-0001".into(), HashSet::from(slot2));

        let (added, removed) = compute_diff(&new_slot, &old_slot);
        println!("a: {:?}, b: {:?}", added, removed);
    }
}
