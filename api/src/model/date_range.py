from datetime import timedelta
from pydantic import BaseModel, Field


class DateRange(BaseModel):
    from_date: timedelta = Field(alias='from')
    to_date: timedelta = Field(alias='to')
