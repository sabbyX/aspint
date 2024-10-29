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

async fn service_auth_middleware(State(state): State<AppState>, req: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_header = req.headers().get(http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok());
    if let Some(auth_header) = auth_header {
        let jwt_pad = "Bearer ";
        if auth_header.starts_with(jwt_pad) {
            let owned_auth = String::from(auth_header.trim_start_matches(jwt_pad));
            let claims = decode_jwt(owned_auth);
            if claims.is_err() {
                Err(StatusCode::UNAUTHORIZED)
            } else if verify_jwt(&state.db, &claims.unwrap()).await.map_err(|_| StatusCode::UNAUTHORIZED)? {
                Ok(next.run(req).await)
            } else { Err(StatusCode::UNAUTHORIZED) }
        } else { Err(StatusCode::UNAUTHORIZED) }
    } else { Err(StatusCode::UNAUTHORIZED) }
}

pub fn service_routes(state: &AppState) -> Router<Arc<AppState>> {
    let authenticated_routes = Router::new()
        .route("/viewInstanceSse", get(view_instance_sse::view_instances_sse))
        .route("/verifyAuth", get(auth::verify_auth))
        .route_layer(middleware::from_fn_with_state(state.clone(), service_auth_middleware));
    
    let unauthenticated_routes = Router::new()
        .route("/authenticateUser", post(auth::authenticate))
        .route("/registerUser", post(auth::auth_register));
    
    Router::new()
        .nest("", authenticated_routes)
        .nest("", unauthenticated_routes)
}
