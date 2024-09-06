from .new_application import NewApplication
from .config import Config
from .applications import Applications
from .appointment_table import AppointmentTable, AvailableSlotTable

__beanie_models__ = [Applications, Config, AppointmentTable]
