import asyncio
from datetime import timedelta
import random
import pymongo
from redis.asyncio import Redis
from redis.commands.json.path import Path
from fastapi import APIRouter, Depends, Request, responses, status
import structlog

from src.cache import get_cache
from src.config import auth_data

from ..model import TlsAdvListerSlotUpdate, AppointmentTable, ListenerData
from ..utils import extract_center_code, serialize_stype, sort_feed
from ..tlshelper import filter_slot

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/internal")


@router.post('/getListenerData')
async def get_listener_data(data: ListenerData, dep_inj_cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
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

@router.post('/allowAssistiveWorkers')
async def allow_assistive_worker(data: ListenerData, deps_inj_cache: Redis = Depends(get_cache)) -> responses.Response:
    assert data.worker_type == "ASSISTIVE"

    exists = await deps_inj_cache.exists(__int_c_k(data.worker_id, data.center))
    if not exists:
        await deps_inj_cache.set(__int_c_k(data.worker_id, data.center), 1)
        await deps_inj_cache.expire(__int_c_k(data.worker_id, data.center), timedelta(seconds=60))

    return responses.Response(status_code=status.HTTP_200_OK)
    

@router.post('/checkAssistLoad')
async def check_assist_load(data: ListenerData, cache: Redis = Depends(get_cache)) -> responses.JSONResponse:
    exists = await cache.exists(__int_c_k(data.worker_id, data.center))
    if exists:
        await cache.delete(__int_c_k(data.worker_id, data.center))
    return responses.JSONResponse({'status': exists})


@router.post("/slotUpdate/{country}/{center}")
async def slot_update(country: str, center: str, data: TlsAdvListerSlotUpdate):
    await logger.debug(f"Received data from tls advanced listener: {center}")
    feed: dict[str, list[dict[str, str]]] = {}

    await logger.debug(f"Normal slots: {len(data.normal)}")
    for date, val in data.normal.items():
        filtered_slots = filter_slot(val, 'normal')
        if len(filtered_slots) > 0:
            feed[date] = filtered_slots

    await logger.debug(f"Prime Time slots: {len(data.prime_time)}")
    for date, val in data.prime_time.items():
        filtered_slots = filter_slot(val, 'pma')
        if len(filtered_slots) > 0:
            if date not in feed:
                feed[date] = filter_slot(val, 'pma')
            else:
                feed[date].extend(filter_slot(val, 'pma'))

    await logger.debug(f"Prime Time Weekend slots: {len(data.prime_time_weekend)}")
    for date, val in data.prime_time_weekend.items():
        filtered_slots = filter_slot(val, 'pmwa')
        if len(filtered_slots) > 0:
            if date not in feed:
                feed[date] = filter_slot(val, 'pmwa')
            else:
                feed[date].extend(filter_slot(val, 'pmwa'))

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

    return responses.Response(status_code=status.HTTP_200_OK)


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
