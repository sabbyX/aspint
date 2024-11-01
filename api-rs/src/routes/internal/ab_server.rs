use std::sync::Arc;
use anyhow::anyhow;
use axum::extract::{Query, State};
use axum::http::StatusCode;
use mongodb::bson::doc;
use serde::Deserialize;
use crate::model::ab_server::ABServer;
use crate::server_err::ServerError;
use crate::state::AppState;

#[derive(Deserialize)]
pub struct QueryData {
    pub server: String,
    pub formid: i32,
}

pub async fn add_ab_server_task( Query(data): Query<QueryData>, State(state): State<Arc<AppState>>) -> Result<StatusCode, ServerError> {
    let coll = state.db.database("aspint").collection::<ABServer>("autobook_servers");
    let server_doc: Option<ABServer> = coll.find_one(doc! {"server": &data.server, }).await?;
    if let Some(server) = server_doc {
        if server.queue.contains(&data.formid) { return Err(ServerError::from_with_code(anyhow!("form id provided already in queue."), StatusCode::BAD_REQUEST)) }
        let filter = doc! {"_id": server.id};
        let update = doc! {"$push": { "queue": data.formid }};
        coll.update_one(filter, update).await?;
    } else {
        let server = ABServer { id: None, server: data.server, queue: vec![data.formid] };
        coll.insert_one(&server).await?;
    }
    Ok(StatusCode::OK)
}

pub async fn remove_ab_server_task(State(state): State<Arc<AppState>>, Query(data): Query<QueryData>) -> Result<StatusCode, ServerError> {
    let col = state.db.database("aspint").collection::<ABServer>("autobook_servers");
    let server_doc: Option<ABServer> = col.find_one(doc! { "server": data.server }).await?;
    if let Some(server) = server_doc {
        let filter = doc! {"_id": server.id};
        let update = doc! {"$pull": { "queue": data.formid }};
        col.update_one(filter, update).await?;
    } else {
        return Err(ServerError::from_with_code(anyhow!("No such server found"), StatusCode::BAD_REQUEST));
    }
    Ok(StatusCode::OK)
}
