use std::sync::Arc;
use axum::{
    extract::{Path, State, Query},
    http::StatusCode,
    response::Json,
};
use redis::AsyncCommands;
use serde::Deserialize;
use serde_json::{json, Value};
use crate::server_err::ServerError;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct AssistiveWorkerPayload {
    pub worker_id: String,
    pub center: String
}

fn get_wid(wid: String) -> String {
    if wid.contains("-") {
        wid.split("-").collect::<Vec<_>>()[0].to_owned()
    } else { wid }
}

pub async fn allow_assistive_worker(
    Path(recommended_sleep): Path<i64>,
    Query(data): Query<AssistiveWorkerPayload>, 
    State(state): State<Arc<AppState>>
) -> Result<StatusCode, ServerError> {
    let mut redis_conn = state.redis.get().await?;
    let real_wid = get_wid(data.worker_id);
    let key = format!("worker_{}:{}", real_wid, data.center);
    if !redis_conn.exists(&key).await? {
        let _: () = redis_conn.set(&key, recommended_sleep).await?;
        let _: () = redis_conn.expire(&key, 60).await?;
    } else { tracing::warn!("allow assistive worker requested while pending permission exists: wid: {} center: {}", real_wid, data.center); }
    Ok(StatusCode::OK)
}

pub async fn check_assist_load(
    Query(data): Query<AssistiveWorkerPayload>,
    State(state): State<Arc<AppState>>
) -> Result<Json<Value>, ServerError> {
    let mut re_conn = state.redis.get().await?;
    let key = format!("worker_{}:{}", get_wid(data.worker_id), data.center);
    let exists: bool = re_conn.exists(&key).await?;
    if exists {
        let rec_sleep: i64 = re_conn.get(&key).await?;
        let _: () = re_conn.del(&key).await?;
        return Ok(Json(json!({"status": exists, "slpt": rec_sleep })));
    }
    Ok(Json(json!({"status": false, "slpt": 0 })))
}
