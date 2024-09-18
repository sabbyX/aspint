use std::{collections::{HashMap, HashSet}, hash::Hash};

use mongodb::{bson::oid::ObjectId, change_stream::event::ResumeToken};
use serde::{Deserialize, Serialize};



#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NotifierSubCol {
    #[serde(rename="_id", skip_serializing_if="Option::is_none")]
    pub id: Option<ObjectId>,
    pub chat_id: i64,
    pub is_subscribed: bool,
    pub sub_centers: Vec<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Slot {
    pub td: String,
    #[serde(rename = "type")]
    pub _type: String, 
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AppointmentTable {
    #[serde(rename="_id", skip_serializing_if="Option::is_none")]
    pub id: Option<ObjectId>,
    pub center: String,
    pub issuer: String,
    pub slots_available: HashMap<String, HashSet<Slot>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AuthUser {
    pub chat_id: i64
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct NotifierResumeToken {
    pub notifier: String,
    pub res_token: ResumeToken
}
