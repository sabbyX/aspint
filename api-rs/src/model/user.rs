use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
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

#[derive(Serialize, Deserialize, Debug)]
pub struct User {
    pub name: String,
    pub username: String,
    pub hashed_password: String,
    pub permission: UserPermission
}
