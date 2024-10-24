use serde::{Serialize, Deserialize};
use chrono::{NaiveTime, NaiveDate};
use indexmap::{IndexMap, IndexSet};
use serde_nested_with::serde_nested;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Slot {
    #[serde(with = "time_formatter")]
    pub td: NaiveTime,
    #[serde(rename = "type")]
    pub _type: String,
}

#[serde_nested]
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppointmentTable {
    #[serde(rename="_id", skip_serializing_if="Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub center: String,
    pub issuer: String,
    #[serde_nested(
        sub = "NaiveDate",
        serde(with = "date_formatter"),
        derive_trait = "PartialEq",
        derive_trait = "Eq",
        derive_trait = "Hash",
    )]
    pub slots_available: IndexMap<NaiveDate, IndexSet<Slot>>,
}

mod date_formatter {
    use chrono::{NaiveDate};
    use serde::{self,  Deserializer, Serializer, Deserialize};

    const FORMAT: &str = "%Y-%m-%d";

    pub fn serialize<S>(date: &NaiveDate, serializer: S) -> Result<S::Ok, S::Error>
    where S: Serializer
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<NaiveDate, D::Error>
    where D: Deserializer<'de>
    {
        let s = String::deserialize(deserializer)?;
        let dt = NaiveDate::parse_from_str(&s, FORMAT).map_err(serde::de::Error::custom)?;
        Ok(dt)
    }
}

mod time_formatter {
    use chrono::{NaiveTime};
    use serde::{self,  Deserializer, Serializer, Deserialize, };

    const FORMAT: &str = "%H:%M";

    pub fn serialize<S>(time: &NaiveTime, serializer: S) -> Result<S::Ok, S::Error>
    where S: Serializer
    {
        let s = format!("{}", time.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserialize: D) -> Result<NaiveTime, D::Error>
    where D: Deserializer<'de>
    {
        let s = String::deserialize(deserialize)?;
        let t = NaiveTime::parse_from_str(&s, FORMAT).map_err(serde::de::Error::custom)?;
        Ok(t)
    }
}
