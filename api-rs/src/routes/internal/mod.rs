use std::sync::Arc;
use axum::extract::Request;
use axum::http::StatusCode;
use axum::middleware::Next;
use axum::response::Response;
use axum::{http, middleware, Router};
use axum::routing::{get, post};
use muddy::{muddy};
use crate::state::AppState;

pub mod health;
pub mod slot_update;
pub mod slot_listener;
pub mod assistive_load;
pub mod rotate_listener;
pub mod freload;

#[muddy]
static AUTH_TOKEN: &str = "Basic df80d0534b4c7631f3e002cfab0939a60e11ef209cc9d8ecdd2387684e5803ef";

async fn internal_auth(req: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_header = req.headers().get(http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let auth_header = if let Some(auth_header) = auth_header {
        auth_header
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    if auth_header == AUTH_TOKEN.to_string() {
        Ok(next.run(req).await)
    } else {
        Err(StatusCode::UNAUTHORIZED)
    }
}

pub fn internal_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/health", get(health::healthcheck))
        .route("/slotUpdateV2/:center", post(slot_update::slot_update))
        .route("/getListenerData", post(slot_listener::get_slot_listener))
        .route("/allowAssistiveWorkers/:ty", get(assistive_load::allow_assistive_worker))
        .route("/checkAssistLoad", get(assistive_load::check_assist_load))
        .route("/rotateListener/:center", get(rotate_listener::rotate_listener))
        .route("/setForceReload/:wid/:center", get(freload::set_force_reload))
        .route("/checkFreload/:wid/:center", get(freload::check_freload))
        .route_layer(middleware::from_fn(internal_auth))
}
