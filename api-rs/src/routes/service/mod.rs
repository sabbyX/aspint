use std::sync::Arc;
use axum::extract::{Request, State};
use axum::middleware::Next;
use axum::{http, middleware, Router};
use axum::http::StatusCode;
use axum::response::Response;
use axum::routing::{get, post};
use crate::state::AppState;
use crate::utils::authentication::{decode_jwt, verify_jwt};

pub mod view_instance_sse;
mod auth;
mod listener_settings;

async fn service_auth_middleware(State(state): State<AppState>, mut req: Request, next: Next) -> Result<Response, StatusCode> {
    let token = req.headers().get(http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .and_then(|header| {
            header.starts_with("Bearer ").then(|| String::from(header.trim_start_matches("Bearer ").trim()))
        }).ok_or(StatusCode::UNAUTHORIZED)?;
    
    let claims = decode_jwt(&token).map_err(|_| StatusCode::UNAUTHORIZED)?;
    let user = verify_jwt(&state, &claims, &token).await.map_err(|_| StatusCode::UNAUTHORIZED)?
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    req.extensions_mut().insert(user);
    Ok(next.run(req).await)
}

pub fn service_routes(state: &AppState) -> Router<Arc<AppState>> {
    let authenticated_routes = Router::new()
        .route("/viewInstanceSse", get(view_instance_sse::view_instances_sse))
        .route("/verifyAuth", get(auth::verify_auth))
        .route("/getAllListenersData", get(listener_settings::get_listeners))
        .route("/setListeners", post(listener_settings::set_listeners))
        .route_layer(middleware::from_fn_with_state(state.clone(), service_auth_middleware));

    let unauthenticated_routes = Router::new()
        .route("/authenticateUser", post(auth::authenticate))
        .route("/registerUser", post(auth::auth_register));

    Router::new()
        .nest("", authenticated_routes)
        .nest("", unauthenticated_routes)
}
