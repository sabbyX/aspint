use std::sync::Arc;
use anyhow::anyhow;
use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json
};
use mongodb::bson::doc;
use futures::TryStreamExt;
use redis::AsyncCommands;
use serde_json::{json, Value};

use crate::model::listener_dbstore::{ListenerCredentialData, ListenerDBCol};
use crate::server_err::ServerError;
use crate::state::AppState;

const MAX_ROTATION: u16 = 3u16;

pub async fn rotate_listener(State(state): State<Arc<AppState>>, Path(center): Path<String>) -> Result<Json<Value>, ServerError> {
    let data: Vec<ListenerDBCol> = state.db
        .database("aspint")
        .collection("slot_listeners")
        .find(doc! {}).await?.try_collect().await?;

    let mut re_conn = state.redis.get().await?;
    let cache_key = format!("rotate:{}", center);
    let rotation = if re_conn.exists(&cache_key).await? { re_conn.get(&cache_key).await? } else { 0u16 };

    async fn internal_rotator(data: &Vec<ListenerDBCol>, rotation: u16, rq_center: &String, mut attempt: usize) -> Result<Option<(ListenerCredentialData, u16)>, ServerError> {
        let mut rotation = rotation % MAX_ROTATION;
        let rotated_data_opt = data.iter().filter(|s| s.rotate_id == rotation).collect::<Vec<&ListenerDBCol>>();
        if rotated_data_opt.is_empty() { return Err(ServerError::from_with_code(anyhow!("potential listener data corruption; expected 3 rotations"), StatusCode::BAD_REQUEST)); }
        let rotated_data = rotated_data_opt[0];
        let (center, ac_choice) = if !rq_center.contains("-") {
            (rq_center, 0)
        } else {
            let split = rq_center.split("-").collect::<Vec<_>>();
            if split.len() < 2 { return Err(ServerError::from(anyhow!("expected center of of type <center>-<id>"))); }
            (&split[0].to_string(), split[1].to_owned().parse::<usize>()?)
        };

        if !rotated_data.cdata.contains_key(center) && attempt < 3 {
            attempt += 1; rotation += 1;
            Ok(Box::pin(internal_rotator(data, rotation, rq_center, attempt)).await?)
        } else if rotated_data.cdata.contains_key(center) {
            if ac_choice > rotated_data.cdata[center].len() { return Err(ServerError::from_with_code(anyhow!("listener index out of range"), StatusCode::BAD_REQUEST)); }
            Ok(Some((rotated_data.cdata[center][ac_choice].clone(), rotation)))
        } else {
            tracing::warn!("failed to find listener for {}", center);
            Ok(None)
        }
    }

    if let Some((listener, curr_rotation)) = internal_rotator(&data, rotation, &center, 0).await? {
        let next_rotation = (curr_rotation + 1) % MAX_ROTATION;
        let _: () = re_conn.set(&cache_key, next_rotation).await?;
        Ok(Json(json!({"status": "ok", "data": listener})))
    } else {
        tracing::warn!("rotation denied for {} (rot: {})", center, rotation);
        Ok(Json(json!({"status": "denied"})))
    }
}
