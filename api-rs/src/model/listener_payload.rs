use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum WorkerType {
    Inde,
    Assistive,
}


#[derive(Clone, Serialize, Deserialize)]
pub struct ListenerPayload {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub center: Option<String>,
    pub worker_type: WorkerType,
    pub worker_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub proxy: Option<String>,
    pub listeners: Vec<String>,
}
