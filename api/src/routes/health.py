from collections import defaultdict
from datetime import datetime, timedelta
from typing import Literal, Optional, TypedDict
from fastapi import APIRouter, Depends, responses, status
from httpx import AsyncClient, TimeoutException

import pymongo
from redis.asyncio import Redis
import structlog

from ..cache import get_cache
from ..model import ListenerHealthData

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/health")

ENDPOINT_PROXY_1 = "http://proxy-1:8000"
ENDPOINT_PROXY_2 = "http://proxy-2:8000"
ENDPOINT_PROXY_3 = "http://proxy-3:8000"
ENDPOINT_PROXY_4 = "http://proxy-4:8000"

STATUS = "/v1/openvpn/status"
IP = "/v1/publicip/ip"


@router.get("/proxy")
async def proxy_server_health_check() -> responses.JSONResponse:
    await logger.debug("Recieved healthcheck for proxy servers")
    resp = {}

    resp[1] = await __int_eval_status(ENDPOINT_PROXY_1)
    resp[2] = await __int_eval_status(ENDPOINT_PROXY_2)
    resp[3] = await __int_eval_status(ENDPOINT_PROXY_3)
    resp[4] = await __int_eval_status(ENDPOINT_PROXY_4) 

    return responses.JSONResponse(resp)


async def __int_eval_status(endpoint):
    try:
        async with AsyncClient() as client:
            _raw = await client.get(endpoint + STATUS)
            status = _raw.json()['status']

            ipdata = await client.get(endpoint + IP)
    except TimeoutException:
        status = "failed"
        ipdata = ""
    
    return {"status": status, "ipdata": ipdata.json()}


class __int_status(TypedDict):
    status: Literal['error', 'warning', 'intermediate', 'running']
    message:  str
    last_fail: int
    fail_rate: int
    worker_id: Optional[str]
    proxy: Optional[str]


def __int_health_set_error(d: __int_status, msg: str):
    d['status'] = 'error'
    d['message'] = msg



def __int_health_set_warning(d: __int_status, msg: str):
    d['status'] = 'warning'
    d['message'] = msg

    
def __int_health_set_intermediate(d: __int_status, msg: str):
    d['status'] = 'intermediate'
    d['message'] = msg


def __int_health_set_running(d: __int_status):
    d['status'] = 'running'
    d['message'] = ""


def __int_nested_dict():
    return defaultdict(__int_nested_dict)


def __int_set_default(d: __int_status, wid):
    d["message"] = ""
    d["fail_rate"] = 0
    d["last_fail"] = 0
    d["worker_id"] = wid
    d["proxy"] = "n/a"



@router.get("/worker")
async def worker_health():
    centers = ["gbLON2", "gbEDI2", "gbMNC2"]
    countries = ["be", "ch", "de", "fr"]
    reg_workers = {
        'gbLON2fr': ['fr-1', 'fr-2'],
    }

    # spec:
    # {
    #   <center>: {
    #       status: error|warning|intermediate|running
    #       message: (none if status is running)
    #       last_fail: (timedelta)
    #       fail_rate: (current session)
    #       worker_id: if
    #       proxy: if
    #   }
    # }
    resp: dict[str, dict[str, __int_status]] = __int_nested_dict()
    db_res = await ListenerHealthData.find_all().sort([
                (ListenerHealthData.created_at, pymongo.DESCENDING)
                ]).to_list()

    for country in countries:
        for center in centers:
            key = center + country
            workers  = reg_workers.get(key, ['common-1'])
            for worker in workers:
                filtered = [x for x in db_res if x.center == key and x.worker_id == worker]

                if worker not in ["common-1"]:
                    center = key + "-" + worker.split('-')[-1]
                else:
                    center = key

                if len(filtered) < 1:
                    __int_set_default(resp[country][center], worker)
                    __int_health_set_error(resp[country][center], "Not found")
                    continue

                latest = filtered[0]
                match latest.health_code:
                    case 200:
                        __int_health_set_running(resp[country][center])
                    case 102:
                        __int_health_set_intermediate(resp[country][center], "Listener is Re/starting.")
                    case 403:
                        __int_health_set_error(resp[country][center], "Blocked by WAF, change proxy.")
                    case 408:
                        __int_health_set_error(resp[country][center], "Timeout: check internet conn.")
                    case 500:
                        __int_health_set_error(resp[country][center], "Internal error occured.")
                    case _:
                        __int_health_set_warning(resp[country][center], "Unknown health code.")


                # set fail rate & history
                total_fails = [x for x in filtered if x.health_code not in [200,102]]
                resp[country][center]['fail_rate'] = len(total_fails)
                delta = timedelta(seconds=0)
                if len(total_fails) > 0:
                    then = total_fails[0].created_at
                    delta = datetime.now() - then
                resp[country][center]["last_fail"] = delta.total_seconds()

                if worker not in ["common-1"]:
                    resp[country][center]["worker_id"] = latest.worker_id
                    resp[country][center]["proxy"] = latest.proxy

    return resp


@router.post("/setWorkerHealth")
async def set_worker_health_info(data: ListenerHealthData, dep_inj_cache: Redis = Depends(get_cache)):
    key = f"health_{data.worker_id}:{data.center}"
    if not await dep_inj_cache.exists(key) or await dep_inj_cache.get(key) != data.health_code:
        await data.save()
        await dep_inj_cache.set(key, data.health_code)
        await dep_inj_cache.expire(key, timedelta(hours=12))

    return responses.Response(status_code=status.HTTP_200_OK)

