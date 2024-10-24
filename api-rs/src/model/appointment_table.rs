use serde::{Serialize, Deserialize};
use indexmap::{IndexMap, IndexSet};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Slot {
    pub td: String,
    #[serde(rename = "type")]
    pub _type: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppointmentTable {
    #[serde(rename="_id", skip_serializing_if="Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub center: String,
    pub issuer: String,
    pub slots_available: IndexMap<String, IndexSet<Slot>>,
}
