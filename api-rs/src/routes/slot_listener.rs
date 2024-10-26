use std::sync::Arc;
use anyhow::anyhow;
use axum::extract::{State, Json};
use axum::http::StatusCode;
use indexmap::IndexMap;
use mongodb::bson::doc;
use crate::model::listener_dbstore::{ListenerCredentialData, ListenerDBCol};
use crate::state::AppState;
use crate::model::listener_payload::ListenerPayload;
use crate::server_err::ServerError;

type ResponsePayload = IndexMap<String, ListenerCredentialData>;
pub async fn get_slot_listener(State(state): State<Arc<AppState>>, Json(payload): Json<ListenerPayload>) -> Result<Json<ResponsePayload>, ServerError> {
    tracing::debug!("Retrieving slot listener data");
    let opt_listeners: Option<ListenerDBCol> = state.db
        .database("aspint")
        .collection::<ListenerDBCol>("slot_listeners")
        .find_one(doc! { "rotate_id": 0 })
        .await?;
    
    if let Some(listeners) = opt_listeners {
        let mut resp_data: ResponsePayload = IndexMap::new();
        
        for rq_center in payload.listeners {
            let (center, ac_choice) = if !rq_center.contains("-") {
                (rq_center, 0)
            } else {
                let split = rq_center.split("-").collect::<Vec<_>>();
                if split.len() < 2 { return Err(ServerError::from(anyhow!("expected center of of type <center>-<id>"))); }
                let ac_choice = split[1].to_owned().parse::<usize>()?;
                (split[0].to_string(), ac_choice)
            };
            
            if listeners.cdata.contains_key(&center) {
                if ac_choice > listeners.cdata[&center].len() { return Err(ServerError::from_with_code(anyhow!("listener index out of range"), StatusCode::BAD_REQUEST)); }
                resp_data.insert(center.clone(), listeners.cdata[&center][ac_choice].clone());
            } else { tracing::warn!("unknown listener requested: {}", &center); }
        }
        
        return Ok(Json(resp_data));
    }
    
    Err(ServerError::from(anyhow!("can't access listener data")))
}
