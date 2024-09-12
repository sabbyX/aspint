from .new_application import NewApplication
from .config import Config
from .applications import Applications
from .appointment_table import AppointmentTable, AvailableSlotTable
from .tls_listerner import TlsAdvListerSlotUpdate

__beanie_models__ = [Applications, Config, AppointmentTable]
