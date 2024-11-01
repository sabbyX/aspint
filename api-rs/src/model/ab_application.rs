use serde::{Deserialize, Serialize};
use crate::model::date_range::DateRange;

#[derive(Serialize, Deserialize, Debug)]
pub struct ABApplication {
    pub name: String,
    pub email: String,
    pub password: String,
    pub center: String,
    pub issuer: String,
    pub formid: i64,
    #[serde(skip_serializing_if="Option::is_none")]
    pub date_range: Option<DateRange>,
    #[serde(rename="allowPremium")]
    pub allow_premium: bool,
}


// #[derive(Serialize, Deserialize, Debug)]
// pub struct ABApplicationView {
//     pub formid: i64,
//     pub name: String,
//     pub email: String,
//     pub issuer: String,
//     pub country: String,
//     pub status: ABHealthQData
// }
