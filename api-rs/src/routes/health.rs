use axum::response;
use serde_json::{Value, json};

pub async fn healthcheck() -> response::Json<Value> {
    response::Json(json!({ "status": "ok" }))
}
