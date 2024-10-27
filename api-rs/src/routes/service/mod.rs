use std::sync::Arc;
use axum::Router;
use axum::routing::get;
use crate::state::AppState;

pub mod view_instance_sse;

pub fn service_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/viewInstanceSse", get(view_instance_sse::view_instances_sse))
}
