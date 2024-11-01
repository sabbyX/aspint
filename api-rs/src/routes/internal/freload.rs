use std::sync::Arc;
use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::Json;
use redis::AsyncCommands;
use serde_json::{json, Value};
use crate::server_err::ServerError;
use crate::state::AppState;

pub async fn set_force_reload(
    State(state): State<Arc<AppState>>,
    Path((wid, center)): Path<(String, String)>,
) -> Result<StatusCode, ServerError> {
    let mut redis_conn = state.redis.get().await?;
    let key = format!("freload:{}:{}", wid, center);
    let _: () = redis_conn.set(&key, 1).await?;
    let _: () = redis_conn.expire(&key, 60*10).await?;
    Ok(StatusCode::OK)
}

pub async fn check_freload(
    State(state): State<Arc<AppState>>,
    Path((wid, center)): Path<(String, String)>,
) -> Result<Json<Value>, ServerError> {
    let mut redis_conn = state.redis.get().await?;
    let key = format!("freload:{}:{}", wid, center);
    let exists: bool = redis_conn.exists(&key).await?;
    let _: () = redis_conn.del(&key).await?;
    Ok(Json(json!({"status": exists})))
}
