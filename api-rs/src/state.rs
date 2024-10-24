use mongodb::Client;

#[derive(Clone)]
pub struct AppState {
    pub(crate) db_client: Client
}
