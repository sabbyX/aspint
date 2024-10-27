use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use crate::model::common_utils::date_formatter;

#[derive(Serialize, Deserialize, Debug)]
pub struct DateRange {
    #[serde(with = "date_formatter")]
    from: NaiveDate,
    #[serde(with = "date_formatter")]
    to: NaiveDate,
}
