use std::{collections::{HashMap, HashSet}, hash::Hash};

use serde::{Deserialize, Serialize};



#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NotifierSubCol {
    pub chat_id: i64,
    pub is_subscribed: bool
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Slot {
    pub td: String,
    #[serde(rename = "type")]
    pub _type: String, 
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppointmentTable {
    pub center: String,
    pub issuer: String,
    pub slots_available: HashMap<String, HashSet<Slot>>,
}
