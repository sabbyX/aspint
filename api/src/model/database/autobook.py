import datetime
from datetime import date
from typing import Optional

from beanie import Document, Indexed
from pydantic import EmailStr, Field, BaseModel

class IntABApplicationDateRange(BaseModel):
    from_: date = Field(alias="from")
    to: date


class ABApplication(Document):
    email: EmailStr
    password: str
    center: str
    issuer: str
    formid: Indexed(int, unique=True)
    date_range: Optional[IntABApplicationDateRange] = None
    allowPremium: bool = False

    class Settings:
        name = "autobook_applications"

class IntABHealthQData(BaseModel):
    status: int
    message: str
    time: datetime.datetime = Field(default_factory=datetime.datetime.now)


class ABHealth(Document):
    """
    health codes specs are maintained in routes::ABService::common::set_ab_health function
    """

    formid: int
    logs: list[IntABHealthQData]

    class Settings:
        name = "autobook_logs"


class ABServerData(Document):
    server_name: str
    current_queue: list[int] = Field(default_factory=list)

    class Settings:
        name = "autobook_servers"
