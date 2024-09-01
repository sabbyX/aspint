from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

from .date_range import DateRange


class NewApplication(BaseModel):
    issuer: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch']
    email: EmailStr
    password: str
    date_range: Optional[DateRange] = Field(None, alias='dateRange')
    preferred_slot_range: bool = Field(alias='preferredSlotRange')
    prime_time_appointment: bool = Field(alias='primeTimeAppointment')
    prime_time_weekend_appointment: bool = Field(alias='primeTimeWeekendAppointment')
