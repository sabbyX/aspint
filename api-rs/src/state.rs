use bb8::Pool;
use bb8_redis::RedisConnectionManager;
use mongodb::Client;

#[derive(Clone)]
pub struct AppState {
    pub(crate) db: Client,
    pub(crate) redis: Pool<RedisConnectionManager>,
}
