use async_once::AsyncOnce;
use lazy_static::lazy_static;
use mongodb::Client;

pub const NOTIFIER_SUB_COL: &str = "notifier_subs";
pub const NOTIFIER_AUTH_COL: &str = "notifier_auth";
pub const NOTIFIER_RESUME_TOKEN_COL: &str = "notifier_resume_token";
pub const AUTH_KEY: &str = "F{0a2n6PSEr`";


lazy_static! {
    pub static ref CLIENT: AsyncOnce<Client> = AsyncOnce::new(async {
        let uri = "mongodb://user:psw@127.0.0.1:27017/?directConnection=true";
        Client::with_uri_str(&uri).await.unwrap()
    });
}


