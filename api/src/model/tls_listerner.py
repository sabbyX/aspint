from pydantic import BaseModel


class TlsAdvListerSlotUpdate(BaseModel):
    normal: dict[str, dict[str, int]]
    prime_time: dict[str, dict[str, int]]
    prime_time_weekend: dict[str, dict[str, int]]
