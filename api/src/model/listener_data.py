from datetime import datetime
from typing import Literal, Optional
from beanie import Document
from pydantic import BaseModel, Field

class ListenerData(BaseModel):
    center: Optional[str] = None
    worker_type: Literal['ASSISTIVE', "INDE"]
    worker_id: str
    proxy: Optional[str] = None
    listeners: Optional[list[str]] = None


class ListenerHealthData(Document, ListenerData):
    created_at: datetime = Field(default_factory=datetime.now)
    health_code: int

    class Settings:
        name = "worker_health"
