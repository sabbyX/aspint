use std::sync::Arc;
use axum::extract::{Path, Json, State};
use axum::http::StatusCode;
use chrono::{NaiveDate, NaiveTime};
use futures::FutureExt;
use indexmap::{IndexMap, IndexSet};
use mongodb::bson::doc;
use mongodb::ClientSession;
use mongodb::options::FindOptions;
use futures::stream::TryStreamExt;
use crate::model::appointment_table::{AppointmentTable, Slot};
use crate::server_err::ServerError;
use crate::state::AppState;
use crate::utils::common::extract_issuer_from_center;

type SlotUpdatePayload = IndexMap<String, IndexMap<String, IndexMap<String, u8>>>;
pub async fn slot_update(Path(center): Path<String>, State(state): State<Arc<AppState>>, Json(payload): Json<SlotUpdatePayload>,) -> Result<StatusCode, ServerError> {
    tracing::debug!("Received slot update for {}", center);

    let mut slot_table = IndexMap::<NaiveDate, IndexSet<Slot>>::new();
    for (slot_type, slots) in payload {
        for (date, slot_info) in slots {
            let mut available_slots = IndexSet::<Slot>::new();
            for (slot_time, is_available) in slot_info {
                if is_available == 1 {
                    available_slots.insert(Slot { td: NaiveTime::parse_from_str(&slot_time, "%H:%M")?, _type: slot_type.clone() });
                }
            }
            if available_slots.is_empty() { continue }
            let typed_date = NaiveDate::parse_from_str(&date, "%Y-%m-%d")?;

            if slot_table.contains_key(&typed_date) {
                slot_table[&typed_date].extend(available_slots);
            } else {
                slot_table.insert(typed_date, available_slots);
            }

            // sort
            if let Some(slots) = slot_table.get_mut(&typed_date) {
                slots.sort_by(|a, b| a.td.cmp(&b.td));
            }
        }
    }

    slot_table.sort_keys();
    let table = AppointmentTable {
        id: None,
        center: center.clone(),
        issuer: extract_issuer_from_center(center.clone())?,
        slots_available: slot_table,
    };

    // ACID-compliant commit, todo: improv database-design/logic to avoid this
    async fn transact(session: &ClientSession, center: String, table: AppointmentTable) -> Result<(), mongodb::error::Error> {
        tracing::debug!("storing slot to database (center: {center})");
        let col = session
            .client()
            .database("aspint")
            .collection::<AppointmentTable>("appointment_table");

        let find_opt = FindOptions::builder()
            .sort(doc! { "_id": 1 })
            .build();

        let docs: Vec<AppointmentTable> = col
            .find(doc! { "center": center })
            .with_options(find_opt)
            .await?
            .try_collect()
            .await?;

        if docs.len() > 1 { col.delete_one(doc! { "_id": docs[0].id.unwrap() }).await?; }
        col.insert_one(table).await?;
        tracing::debug!("slot saved");
        Ok(())
    }

    let mut session = state.db_client.start_session().await?;
    session.start_transaction()
        .and_run((), |session, _| transact(session, center.clone(), table.clone()).boxed())
        .await?;

    Ok(StatusCode::OK)
}
