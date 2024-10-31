use std::sync::Arc;
use std::time::Duration;
use async_stream::stream;
use axum::extract::State;
use axum::response::Sse;
use axum::response::sse::Event;
use tokio_stream::StreamExt as _;
use futures::stream::{Stream};
use indexmap::IndexSet;
use mongodb::bson::{bson, doc, Document};
use mongodb::change_stream::event::OperationType;
use mongodb::Database;
use mongodb::options::{FullDocumentBeforeChangeType, FullDocumentType};
use serde_json::json;
use crate::model::ab_application::ABApplication;
use crate::model::ab_health::ABHealth;
use crate::model::ab_server::ABServer;
use crate::server_err::ServerError;
use crate::state::AppState;

fn internal_stream(db: Database) -> impl Stream<Item = Result<Event, anyhow::Error>> {
    stream! {
        let init_applications: Vec<Document> = db.collection::<ABApplication>("autobook_applications")
            .aggregate(vec![
                doc! {
                    "$lookup": {
                        "from": "autobook_logs",
                        "localField": "formid",
                        "foreignField": "formid",
                        "pipeline": vec! [
                            doc! {"$addFields": { "latestStatus": { "$last": "$logs" }}},
                        ],
                        "as": "status_logs",
                    }
                },
                doc! { "$unwind": "$status_logs" },
                doc! {
                    "$project": {
                        "_id": 0,
                        "formid": 1,
                        "name": 1,
                        "email": 1,
                        "issuer": 1,
                        "country": 1,
                        "status": "$status_logs.latestStatus.message",
                    }
                },
            ])
            .await?
            .collect()
            .await?;
        // let parsed_applications: Vec<ABApplicationView> = init_applications.iter().map(|e| serde_json::from_str(&serde_json::to_string(e).unwrap()).unwrap()).collect();
        let event = Event::default()
            .event("initApplications")
            .json_data(json!({"data": init_applications}))?;
        yield Ok(event);
        
        let init_abservers: Vec<ABServer> = db.collection::<ABServer>("autobook_servers").find(doc! {})
            .projection(doc! { "_id": 0})
            .await?
            .collect()
            .await?;
        let event = Event::default()
            .event("initABServers")
            .json_data(json!({"data": init_abservers}))?;
        yield Ok(event);

        let mut db_change_stream = db.watch()
            .pipeline(vec![doc! { "$match": { "ns.coll" : { "$in": ["autobook_applications", "autobook_logs", "autobook_servers"]}}}])
            .full_document(FullDocumentType::WhenAvailable)
            .full_document_before_change(FullDocumentBeforeChangeType::WhenAvailable)
            .await?;

        while let Some(event) = db_change_stream.next().await.transpose()? {
            if let Some(ns) = event.ns {
                if let Some(col) = ns.coll {
                    let event = match col.as_str() {
                        "autobook_applications" => {
                             match event.operation_type {
                                OperationType::Insert | OperationType::Update => {
                                    // todo: use serde-transcode?
                                    let doc: ABApplication = serde_json::from_str(&serde_json::to_string(&event.full_document.unwrap())?)?;
                                    let status_log: Option<ABHealth> = db.collection::<ABHealth>("autobook_logs")
                                        .find_one(doc! {"formid": doc.formid})
                                        .await.unwrap();
                                    let status = if let Some(status_log) = status_log {
                                        json!(status_log.logs.last())
                                    } else { json!({}) };
                                    Event::default()
                                        .event("newABApplication")
                                        .json_data(json!({"formid": doc.formid, "name": doc.name, "email": doc.email, "status": status, "issuer": doc.issuer, "center": doc.center}))?
                                }
                                OperationType::Delete => {
                                    Event::default()
                                        .event("deleteABApplication")
                                        .json_data(json!({"formid": event.full_document_before_change.unwrap().get("formid").unwrap_or(&bson!(0)).as_i32().unwrap_or(0)}))?
                                },
                                _ => Event::default().event("IGNORE_EVENT"), // todo: better?
                            }
                        },
                        "autobook_logs" => {
                            match event.operation_type {
                                OperationType::Insert | OperationType::Update => {
                                    let doc: ABHealth = serde_json::from_str(&serde_json::to_string(&event.full_document.unwrap())?)?;
                                    Event::default()
                                    .event("newABLog")
                                    .json_data(json!({"formid": doc.formid, "last_status": doc.logs.last()}))?
                                },
                                _ => Event::default().event("IGNORE_EVENT"),
                            }
                        },
                        "autobook_servers" => {
                            match event.operation_type {
                                OperationType::Insert | OperationType::Update => {
                                    let curr_doc: ABServer = serde_json::from_str(&serde_json::to_string(&event.full_document.unwrap())?)?;
                                    if let Some(generic_before_doc) = event.full_document_before_change {
                                        let before_doc: ABServer = serde_json::from_str(&serde_json::to_string(&generic_before_doc)?)?;
                                        if curr_doc.queue.len() > before_doc.queue.len() {
                                            Event::default()
                                                .event("newABTask")
                                                .json_data(json!({"server_id": curr_doc.server, "addition": curr_doc.queue.last()}))?
                                        } else {
                                            let curr_set: IndexSet<&i32> = IndexSet::from_iter(curr_doc.queue.iter());
                                            let before_set: IndexSet<&i32> = IndexSet::from_iter(before_doc.queue.iter());
                                            let deletion = before_set.difference(&curr_set).collect::<Vec<_>>();
                                            Event::default().event("removeABTask")
                                                .json_data(json!({"server_id": curr_doc.server, "deletion": deletion.last()}))?
                                        }
                                    } else {
                                        Event::default().event("newABTask")
                                            .json_data(json!({"server_id": curr_doc.server, "addition": curr_doc.queue.last()}))?
                                    }
                                },
                                _ => Event::default().event("IGNORE_EVENT"),
                            }
                        }
                        _ => todo!()
                    };
                    yield Ok(event);
                }
            }
        };
    }
}

pub async fn view_instances_sse(
    State(state): State<Arc<AppState>>,
) -> Result<Sse<impl Stream<Item = Result<Event, anyhow::Error>>>, ServerError> {
    for i in ["autobook_applications", "autobook_logs", "autobook_servers"] {
        let _ = state.db.database("aspint").run_command(doc! {"collMod": i,"changeStreamPreAndPostImages": {"enabled": true,}}).await;
    }
    
    Ok(Sse::new(internal_stream(state.db.database("aspint")))
        .keep_alive(
            axum::response::sse::KeepAlive::new()
                .interval(Duration::from_secs(1))
                .text("keep-alive-text"),
        )
    )
}
