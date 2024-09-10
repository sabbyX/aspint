use std::collections::{HashMap, HashSet};

use crate::{error::Error, model::{AppointmentTable, Slot}};

pub enum SupportedCountries {
    Ch,
}

impl SupportedCountries {
    pub fn from(input: String) -> Result<SupportedCountries, Error> {
        match input.as_str() {
            "ch" | "switzerland" => Ok(Self::Ch),
            _ => Err(Error::UnsupportedCountry(input))
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
                if updated_removed.len() > 0 {
                    removed.insert(key.clone(), updated_removed);
                }

                let updated_added = value.difference(old_value)
                    .cloned()
                    .collect::<HashSet<_>>();
                if updated_added.len() > 0 {
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
