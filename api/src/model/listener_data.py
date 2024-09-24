from typing import Literal, Optional
from beanie import Document
from pydantic import BaseModel

class ListenerData(BaseModel):
    center: Optional[str] = None
    worker_type: Literal['ASSISTIVE', "INDE"]
    worker_id: str
    listeners: Optional[list[str]] = None


class ListenerHealthData(Document, ListenerData):
    health_code: int

    class Settings:
        name = "worker_health"
