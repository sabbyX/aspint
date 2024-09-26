use env_logger::Env;

mod bot;
mod constants;
mod error;
mod utils;
mod model;
mod subscribe;
mod watch;
mod table;
mod health;

#[tokio::main]
async fn main() {
    env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();
    bot::run().await;
}
