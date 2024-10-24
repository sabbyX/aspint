use std::sync::Arc;
use axum::{routing::{get, post}, Router};
use mongodb::Client;
use tower_http::trace::TraceLayer;
use crate::routes;
use crate::state::AppState;

pub async fn server() -> anyhow::Result<()> {
    let db_conn_uri = "mongodb://user:psw@127.0.0.1:27017/?directConnection=true";
    let dbclient = Client::with_uri_str(db_conn_uri).await?;
    let app_state = AppState {
      db_client: dbclient
    };
    let app = Router::new()
        .route("/health", get(routes::health::healthcheck))
        .route("/slotUpdateV2/:center/", post(routes::slot_update::slot_update))
        .layer(TraceLayer::new_for_http())
        .with_state(Arc::new(app_state));

    let listener = tokio::net::TcpListener::bind("localhost:7777").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
