use axum::extract::{Path, Json};
use indexmap::IndexMap;

//dict[str, dict[str, dict[str, int]]],
pub async fn slot_update(Path(center): Path<String>, Json(payload): Json<IndexMap<String, IndexMap<String, IndexMap<String, i64>>>>) {
    tracing::debug!("Received slot update for {}", center);

}
