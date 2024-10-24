use std::sync::Arc;
use axum::{routing::get, Router};
use mongodb::Client;
use tower_http::trace::TraceLayer;
use crate::routes::health::healthcheck;
use crate::model::appointment_table::AppointmentTable;
use crate::state::AppState;

pub async fn server() -> anyhow::Result<()> {
    let db_conn_uri = "mongodb://user:psw@127.0.0.1:27017/?directConnection=true";
    let dbclient = Client::with_uri_str(db_conn_uri).await?;
    let app_state = AppState {
      appointment_table_db: dbclient.database("aspint").collection::<AppointmentTable>("appointment_table"),
    };
    let app = Router::new()
        .route("/health", get(healthcheck))
        .layer(TraceLayer::new_for_http())
        .with_state(Arc::new(app_state));

    let listener = tokio::net::TcpListener::bind("localhost:7777").await?;
    axum::serve(listener, app).await?;

    Ok(())
}
