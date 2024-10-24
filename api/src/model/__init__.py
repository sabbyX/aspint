from .config import Config
from .appointment_table import AppointmentTable, AvailableSlotTable
from .listener_data import ListenerData, ListenerHealthData

from .database import User, ABHealth, ABApplication, IntABHealthQData, IntABApplicationDateRange
from .database import ABListener2ResumeToken, ABListener1ResumeToken

__beanie_models__ = [
    Config, AppointmentTable, ListenerHealthData, User, ABHealth, ABApplication,
    ABListener2ResumeToken, ABListener1ResumeToken
]
