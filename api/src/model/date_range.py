from datetime import date
from pydantic import BaseModel, Field


class DateRange(BaseModel):
    from_date: date = Field(alias='from')
    to_date: date = Field(alias='to')
