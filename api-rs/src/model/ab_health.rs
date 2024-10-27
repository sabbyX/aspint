use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ABHealthQData {
    pub status: i32,
    pub message: String,
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub time: chrono::DateTime<chrono::offset::Utc>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ABHealth {
    pub formid: i32,
    pub logs: Vec<ABHealthQData>,
}
