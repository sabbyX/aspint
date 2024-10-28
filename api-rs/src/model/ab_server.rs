use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ABServer {
    #[serde(rename="_id", skip_serializing_if="Option::is_none", default)]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub server: String,
    pub queue: Vec<i32>,
}
