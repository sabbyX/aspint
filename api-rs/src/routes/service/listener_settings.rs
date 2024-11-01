use std::sync::Arc;
use anyhow::anyhow;
use axum::extract::{State, Extension};
use axum::Json;
use axum::http::StatusCode;
use mongodb::bson::doc;
use serde_json::{json, Value};
use futures::TryStreamExt;
use serde::{Deserialize, Serialize};
use crate::model::listener_dbstore::ListenerDBCol;
use crate::model::user::{User, UserPermission};
use crate::server_err::ServerError;
use crate::state::AppState;

pub async fn get_listeners(State(state): State<Arc<AppState>>, Extension(user): Extension<User>) -> Result<Json<Value>, ServerError> {
    if user.permission != UserPermission::ElevatedUser { Err(ServerError::from_with_code(anyhow!("access restricted to standarduser"), StatusCode::UNAUTHORIZED)) }
    else {
        let all_data: Vec<ListenerDBCol> = state.db.database("aspint")
            .collection::<ListenerDBCol>("slot_listeners")
            .find(doc! {})
            .projection(doc! { "_id": 0 })
            .await?
            .try_collect()
            .await?;

        Ok(Json(json!({"data": all_data})))
    }
}


#[derive(Serialize, Deserialize, Debug)]
pub struct SetListenerPayload {
    data: Vec<ListenerDBCol>
}

pub async fn set_listeners(State(state): State<Arc<AppState>>, Extension(user): Extension<User>, Json(payload): Json<SetListenerPayload>) -> Result<StatusCode, ServerError> {
    if user.permission != UserPermission::ElevatedUser { Err(ServerError::from_with_code(anyhow!("access restricted to standarduser"), StatusCode::UNAUTHORIZED)) }
    else {
        let current_data: Vec<ListenerDBCol> = state.db.database("aspint")
            .collection::<ListenerDBCol>("slot_listeners")
            .find(doc! {})
            .projection(doc! { "_id": 0 })
            .await?
            .try_collect()
            .await?;
        if current_data == payload.data {
            Err(ServerError::from_with_code(anyhow!("no change detected"), StatusCode::BAD_REQUEST))
        } else {
            for doc in &payload.data {
                let filter = doc! { "rotate_id": doc.rotate_id as i32 };
                state.db.database("aspint")
                    .collection::<ListenerDBCol>("slot_listeners")
                    .replace_one(filter, doc)
                    .await?;
            }
            Ok(StatusCode::OK)
        }
    }
}
