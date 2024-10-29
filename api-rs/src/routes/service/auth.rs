use std::sync::Arc;
use crate::muddy_internal;
use anyhow::anyhow;
use axum::extract::{State, Json};
use axum::http::StatusCode;
use mongodb::bson::doc;
use muddy::m;
use serde::{Deserialize, Serialize};
use password_auth::{verify_password, generate_hash};
use serde_json::{json, Value};
use crate::model::user::{User, UserPermission};
use crate::server_err::ServerError;
use crate::state::AppState;
use crate::utils::authentication::generate_jwt;

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthFormPayload {
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthRegisterPayload {
    pub name: String,
    pub username: String,
    pub password: String,
    #[serde(default)]
    pub perm: UserPermission,
    pub nro: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AuthResponse {
    pub token: String,
}

pub async fn authenticate(State(state): State<Arc<AppState>>, Json(payload): Json<AuthFormPayload>) -> Result<Json<Value>, ServerError> {
    if payload.username.is_empty() || payload.password.is_empty() {
        Err(ServerError::from_with_code(anyhow!("invalid credentials"), StatusCode::BAD_REQUEST))
    } else {
        let user: User = state.db.database("aspint")
            .collection::<User>("service_users")
            .find_one(doc! { "username": payload.username }).await?
            .ok_or_else(|| ServerError::from_with_code(anyhow!("invalid credentials"), StatusCode::UNAUTHORIZED))?;
        verify_password(payload.password, &user.hashed_password).map_err(|_| ServerError::from_with_code(anyhow!("invalid credentials"), StatusCode::UNAUTHORIZED))?;
        let token = generate_jwt(&user).map_err(|_| ServerError::from_with_code(anyhow!("failed to gen token"), StatusCode::UNAUTHORIZED))?;
        Ok(Json(json!(AuthResponse { token})))
    }
}


pub async fn auth_register(State(state): State<Arc<AppState>>, Json(payload): Json<AuthRegisterPayload>) -> Result<Json<Value>, ServerError> {
    if payload.username.is_empty() || payload.password.is_empty() {
        Err(ServerError::from_with_code(anyhow!("invalid credentials"), StatusCode::BAD_REQUEST))
    } else {
        let hashed_password = generate_hash(&payload.password);
        let mut user = User { name: payload.name.clone(), username: payload.username.clone(), hashed_password, permission: UserPermission::StandardUser };
        if let Some(nro) = payload.nro {
            if nro == m!("f58ff36376516933dd1691cd50b31714f3284000b696ce9f8087f251a25e16c5") {
                user.permission = payload.perm;
            }
        }
        state.db.database("aspint")
            .collection::<User>("service_users")
            .insert_one(&user)
            .await?;
        Ok(Json(json!({"status": "ok"})))
    }
}
