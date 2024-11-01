use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};

pub struct ServerError(pub anyhow::Error, Option<StatusCode>);

impl IntoResponse for ServerError {
    fn into_response(self) -> Response {
        if let Some(status) = self.1 {
            (
                status,
                format!("{}", self.0)
            ).into_response()
        }
        else {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Unhandled internal error: {}", self.0),
            ).into_response()
        }
    }
}

impl<E> From<E> for ServerError
where
    E: Into<anyhow::Error>,
{
    fn from(err: E) -> Self {
        Self(err.into(), None)
    }
}

impl ServerError {
    pub fn from_with_code<E>(err: E, code: StatusCode) -> Self 
    where 
        E: Into<anyhow::Error>,
    {
        Self(err.into(), Some(code))
    }
}
