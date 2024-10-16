from datetime import timedelta
import pymongo
from redis.asyncio import Redis
from fastapi import APIRouter, Depends, responses, status
import structlog

from ..cache import get_cache
from ..config import auth_data, rotate1, rotate2

from ..model import AppointmentTable, ListenerData
from ..common import FRELOAD_KEY, force_restart_listener
from ..utils import extract_center_code, sort_feed, filter_slot

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/internal")


@router.post('/getListenerData')
async def get_listener_data(data: ListenerData, _cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
    assert data.listeners is not None
    resp = {}

    def clean(center: str):
        if data.worker_type == "ASSISTIVE" and "-" in center:
            return center.split('-')[0]
        return center

    for center in data.listeners:
        cdata = auth_data.get(center, None)
        if cdata is not None:
            resp[clean(center)] = cdata
    
    return responses.JSONResponse(resp)


def __int_c_k(wid, c):
    return f"worker_{wid.split('-')[0]}:{c}"

@router.post('/allowAssistiveWorkers/{ty}')
async def allow_assistive_worker(data: ListenerData, ty: int, deps_inj_cache: Redis = Depends(get_cache)) -> responses.Response:
    assert data.worker_type == "ASSISTIVE"

    exists = await deps_inj_cache.exists(__int_c_k(data.worker_id, data.center))
    if not exists:
        await deps_inj_cache.set(__int_c_k(data.worker_id, data.center), ty)
        await deps_inj_cache.expire(__int_c_k(data.worker_id, data.center), timedelta(seconds=60))

    return responses.Response(status_code=status.HTTP_200_OK)
    

@router.post('/checkAssistLoad')
async def check_assist_load(data: ListenerData, cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
    exists = await cache.exists(__int_c_k(data.worker_id, data.center))
    ty = await cache.get(__int_c_k(data.worker_id, data.center))
    if exists:
        await cache.delete(__int_c_k(data.worker_id, data.center))
    return responses.JSONResponse({'status': exists, 'slpt': ty})


@router.get('/setForceReload/{wid}/{center}')
async def force_reload(wid: str, center: str, cache: Redis = Depends(get_cache)) -> responses.HTMLResponse:
    return await force_restart_listener(wid, center, cache)


@router.get('/checkFreload/{wid}/{center}')
async def check_freload(wid: str, center: str, cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
    exists = await cache.exists(FRELOAD_KEY.format(wid, center))
    if exists:
        await cache.delete(FRELOAD_KEY.format(wid, center))
    return responses.JSONResponse({'status': exists})


@router.post("/slotUpdateV2/{center}")
async def slot_update(
    center: str, 
    data: dict[str, dict[str, dict[str, int]]],
    ):
    await logger.debug(f"Received slot update request for {center}", data_count=len(data))
    country = extract_center_code(center)
    
    feed: dict[str, list[dict[str, str]]] = {}
    for ty, slots in data.items():
        ty = ty.replace('%%', ' ')
        for date, val in slots.items():
            filtered_slots = filter_slot(val, ty)
            if len(filtered_slots) > 0:
                if date not in feed:
                    feed[date] = filtered_slots
                else:
                    feed[date].extend(filtered_slots)

    await logger.debug("storing slots into database...")
    doc = AppointmentTable(issuer=country, center=center, slots_available=feed)
    doc.slots_available = sort_feed(doc.slots_available)
    res: list[AppointmentTable] = await AppointmentTable.find(
        AppointmentTable.issuer == country,
        AppointmentTable.center == center,
    ).sort(
        [
            (AppointmentTable.id, pymongo.DESCENDING)
        ]
    ).to_list()
    await logger.debug("found slots at database", count=len(res))
    if len(res) > 1:
        await res[1].delete()
    await doc.save()
    await logger.debug("saved slot info")

ROTATE_KEY = "rotate:{}"

def __int_rotate(rotation: int, center: str) -> tuple[dict[str, str | int], int]:
    # todo: improv
    if rotation == 0:
        if center in rotate1:
            return rotate1[center], 1
        elif center in rotate2:
            return rotate2[center], 2
        else:
            return None
    elif rotation == 1:
        if center in rotate2:
            return rotate2[center], 2
        else:
            return auth_data[center], 0
    elif rotation == 2:
        if center in auth_data:
            return auth_data[center], 0
        elif center in rotate1:
            return rotate1[center], 1
        else:
            return None


@router.get('/rotateListener/{center}')
async def rotate_listener(center: str, cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
    key = ROTATE_KEY.format(center)
    current_rotation = 0 if not await cache.exists(key) else int(await cache.get(key))
    unpack = __int_rotate(current_rotation, center)
    if unpack is not None:
        data, rotation = unpack
        await cache.set(key, rotation)
        return responses.JSONResponse({"status": "ok", "data": data})
    else:
        return responses.JSONResponse({"status": "denied"})
