mod server;
mod model;
mod state;
mod server_err;
mod routes;
mod utils;

#[tokio::main]
async fn main() {
    println!("Hello, world!");

    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    server::server().await.unwrap();
}
