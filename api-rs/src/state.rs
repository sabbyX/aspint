use mongodb::Client;
use redis::aio::ConnectionManager;

#[derive(Clone)]
pub struct AppState {
    pub(crate) db_client: Client,
    pub(crate) redis: ConnectionManager
}
