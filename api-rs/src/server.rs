use tower_layer::Layer;
use std::sync::Arc;
use axum::{routing::{get, post}, Router, ServiceExt, extract::Request};
use mongodb::Client;
use tower_http::{trace::TraceLayer, normalize_path::NormalizePathLayer};
use crate::routes;
use crate::state::AppState;

pub async fn server() -> anyhow::Result<()> {
    let db_conn_uri = "mongodb://user:psw@127.0.0.1:27017/?directConnection=true";
    let dbclient = Client::with_uri_str(db_conn_uri).await?;
    let redis_client = redis::Client::open("redis://127.0.0.1:6379/")?;
    let redis_conn_manager = redis::aio::ConnectionManager::new(redis_client).await?;
    let app_state = AppState { 
        db_client: dbclient,
        redis: redis_conn_manager
    };
    let app = Router::new()
        .route("/health", get(routes::health::healthcheck))
        .route("/slotUpdateV2/:center", post(routes::slot_update::slot_update))
        .route("/getListenerData", post(routes::slot_listener::get_slot_listener))
        .layer(TraceLayer::new_for_http())
        .with_state(Arc::new(app_state));

    let app = NormalizePathLayer::trim_trailing_slash().layer(app);
    let app = ServiceExt::<Request>::into_make_service(app);
    let listener = tokio::net::TcpListener::bind("localhost:7777").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
