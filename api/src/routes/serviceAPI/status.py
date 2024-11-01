from datetime import datetime
from typing import Annotated, Optional

import pandas as pd
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...model import ListenerHealthData, User
from ...utils import get_current_user

router = APIRouter(prefix="/status")

# todo: abstract with internal API used by tls-listener/notifier
def __int_set_health_level(health_code: int) -> str:
    match health_code:
        case 200:
            return "OK"
        case 102:
            return "INIT"
        case 403:
            return "BLOCK"
        case 408:
            return "TIMEOUT"
        case 500:
            return "INTERNAL_ERROR"
        case _:
            return "UNKNOWN"

class HealthView(BaseModel):
    index: datetime
    worker_id: str | None = None
    health_code: int

    class Settings:
        projection = { "_id": 0, "index": "$created_at", "health_code": "$health_code" }


class __IntPayloadModel(BaseModel):
    interval: datetime
    status: str
    code: int


async def __int_get_df_status(center: str, worker_id: Optional[str] = None) -> list[__IntPayloadModel]:
    upt_array = []
    if worker_id and False:
        logs = await ListenerHealthData.find_many(ListenerHealthData.worker_id == worker_id, ListenerHealthData.center == center).project(HealthView).to_list()
    else:
        logs = await ListenerHealthData.find(ListenerHealthData.center == center).project(HealthView).to_list()

    if len(logs) == 0: return []

    logs_json = [x.model_dump() for x in logs]
    df = pd.DataFrame(logs_json)
    df['index'] = pd.to_datetime(df['index'])
    grouped: pd.DataFrame = df.groupby(pd.Grouper(key="index", freq="5Min", label="right")).max()
    last_data = None
    for idx, _wid, code in zip(grouped.index, grouped.worker_id, grouped.health_code): # type: pd.Timestamp, str, float
        # todo: support wid
        if code.is_integer():
            resp_data = __IntPayloadModel(interval=idx.to_pydatetime(), status=__int_set_health_level(int(code)), code=int(code))
            last_data = resp_data
        else:
            assert last_data is not None  # last_data is 'guaranteed' by pandas
            resp_data = last_data
        upt_array.append(resp_data)
    return upt_array[-60:]


@router.get("/")
async def status_root(_: Annotated[User, Depends(get_current_user)], center: str, worker_id: Optional[str] = None) -> list[__IntPayloadModel]:
    status_arr = await __int_get_df_status(center, worker_id)
    return status_arr
