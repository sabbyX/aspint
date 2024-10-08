from datetime import datetime
from typing import Annotated, Optional

import pandas as pd
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ...model import ListenerHealthData, User
from ...utils import get_current_user

router = APIRouter(prefix="/status")


test_logs = [
    {
        "index": "2024-10-06 03:40:57",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 04:11:00",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 05:07:20",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 03:53:51",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 05:28:26",
        "health_code": 500,
    },
    {
        "index": "2024-10-06 11:13:24",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 07:05:27",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 11:54:20",
        "health_code": 200,
    },
    {
        "index": "2024-10-06 10:22:37",
        "health_code": 500,
    },
    {
        "index": "2024-10-06 07:48:56",
        "health_code": 200,
    }
]


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


async def __int_get_df_status(center: str, worker_id: Optional[str] = None) -> list[dict[str, str]]:
    upt_array = []
    if worker_id and False:
        #logs = await ListenerHealthData.find_many(ListenerHealthData.worker_id == worker_id, ListenerHealthData.center == center).project(HealthView).to_list()
        logs = test_logs
    else:
        # logs = await ListenerHealthData.find(ListenerHealthData.center == center).project(HealthView).to_list()
        logs = test_logs

    df = pd.DataFrame(logs)
    df['index'] = pd.to_datetime(df['index'])
    grouped: pd.DataFrame = df.groupby(pd.Grouper(key="index", freq="5Min", label="right")).max()
    last_data = None
    for code in grouped.values:
        if not pd.isna(code):
            resp_data = {"status": __int_set_health_level(int(code[0].item())), "code": int(code[0].item())}
            last_data = resp_data
        else:
            assert last_data is not None  # last_data is 'guaranteed' by pandas :think:
            resp_data = last_data
        upt_array.append(resp_data)
    return upt_array[-60:]


@router.get("/")
async def status_root(_: Annotated[User, Depends(get_current_user)], center: str, worker_id: Optional[str] = None):
    return __int_get_df_status(center)
