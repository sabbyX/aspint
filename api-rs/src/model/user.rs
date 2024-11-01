use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum UserPermission {
    StandardUser,
    ElevatedUser,
}

impl Default for UserPermission {
    fn default() -> Self {
        Self::StandardUser
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    #[serde(rename="_id", skip_serializing_if="Option::is_none")]
    pub id: Option<mongodb::bson::oid::ObjectId>,
    pub name: String,
    pub username: String,
    pub hashed_password: String,
    pub permission: UserPermission
}
