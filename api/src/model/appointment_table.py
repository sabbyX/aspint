import datetime
from typing import Literal, Dict
from datetime import date, time
from beanie import Document
from pydantic import BaseModel


class Slot(BaseModel):
    td: time
    type: Literal['normal', 'pma', 'pmwa']


class AvailableSlotTable(BaseModel):
    slots_available: dict[date, list[Slot]]


class AppointmentTable(Document):
    issuer: Literal['ch', 'fr']
    center: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch']
    slots_available: dict[date, list[Slot]]

    class Settings:
        name = 'appointment_table'
        bson_encoders = {
            datetime.date: lambda d: d.strftime('%Y-%m-%d'),
            datetime.time: lambda t: t.strftime('%H:%M'),
        }
