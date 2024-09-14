use env_logger::Env;

mod bot;
mod constants;
mod error;
mod utils;
mod model;
mod subscribe;
mod watch;

#[tokio::main]
async fn main() {
    let _ = env_logger::Builder::from_env(Env::default().default_filter_or("debug")).init();
    bot::run().await;
}
