use indexmap::IndexMap;
use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct ListenerCredentialData {
    pub username: String,
    pub password: String,
    pub fg_id: i64,
    pub country: String,
}


#[derive(Deserialize, Serialize, Debug, Clone, PartialEq)]
pub struct ListenerDBCol {
    pub rotate_id: u16,
    pub cdata: IndexMap<String, Vec<ListenerCredentialData>>,
}
