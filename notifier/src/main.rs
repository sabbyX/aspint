mod bot;
mod error;
mod utils;
mod model;

#[tokio::main]
async fn main() {
    env_logger::init();
    bot::run().await;
}
