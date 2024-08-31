import datetime

from pydantic import BaseModel, Field


class DateRange(BaseModel):
    from_date: datetime = Field(alias='from')
    to_date: datetime = Field(alias='to')
