use serde::{Serialize, Deserialize};
use chrono::{NaiveTime, NaiveDate};
use indexmap::{IndexMap, IndexSet};
use serde_nested_with::serde_nested;
use crate::model::common_utils::{date_formatter,time_formatter};

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
