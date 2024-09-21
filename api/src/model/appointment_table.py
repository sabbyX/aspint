import datetime
from typing import Literal, Dict, Optional
from datetime import date, time
from beanie import Document
from pydantic import BaseModel


class Slot(BaseModel):
    td: time
    type: str


class AvailableSlotTable(BaseModel):
    slots_available: dict[date, list[Slot]]


class AppointmentTable(Document):
    issuer: Literal['ch', 'fr', 'be', 'de']
    center: Literal[
        'gbLON2ch', 'gbEDI2ch', 'gbMNC2ch',
        'gbLON2be', 'gbEDI2be', 'gbMNC2be',
        'gbLON2fr', 'gbEDI2fr', 'gbMNC2fr',
        'gbLON2de', 'gbEDI2de', 'gbMNC2de',
    ]
    slots_available: dict[date, list[Slot]]

    class Settings:
        name = 'appointment_table'
        bson_encoders = {
            datetime.date: lambda d: d.strftime('%Y-%m-%d'),
            datetime.time: lambda t: t.strftime('%H:%M'),
        }
