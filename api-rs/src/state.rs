use mongodb::Collection;
use crate::model::appointment_table::AppointmentTable;

#[derive(Clone)]
pub struct AppState {
    pub(crate) appointment_table_db: Collection<AppointmentTable>
}
