use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("teloxide error: {0}")]
    TeloxideError(#[from] teloxide::RequestError),
    #[error("mongodb error: {0}")]
    MongoDBError(#[from] mongodb::error::Error),
    #[error("reqwest error: {0}")]
    ReqwestError(#[from] reqwest::Error),
}
