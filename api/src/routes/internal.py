from datetime import timedelta
import pymongo
from redis.asyncio import Redis
from redis.commands.json.path import Path
from fastapi import APIRouter, Depends, responses, status
import structlog

from src.cache import get_cache

from ..model import TlsAdvListerSlotUpdate, AppointmentTable
from ..utils import extract_center_code, serialize_stype, sort_feed
from ..tlshelper import filter_slot

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/internal")


@router.get('/getSlotListenerData')
async def slot_listener_data():
    pass


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


@router.post("/lazyUpdate/{uid}/{type}/{center}")
async def lazy_update(
    uid: int, 
    type: str, 
    center: str, 
    data: dict[str, dict[str, int]],
    deps_inj_cache: Redis = Depends(get_cache)
    ):
    await logger.debug(f"Received lazy load request for {center}::{type} with uid:{uid}", data_count=len(data))
    country = extract_center_code(center)
    if not await deps_inj_cache.exists(str(uid)):
        await deps_inj_cache.json().set(str(uid), Path.root_path(), {})
        await deps_inj_cache.expire(str(uid), timedelta(seconds=120))
    await deps_inj_cache.json().set(str(uid), '.' + type.replace(' ', '%%'), data)

    # check if data is complete?
    cdata: dict[str, dict[str, dict[str, int]]] = await deps_inj_cache.json().get(uid)
    await logger.debug(cdata)
    fc = 4 if country in ["fr"] else 3
    if len(cdata.keys()) < fc:
        return responses.Response(status_code=status.HTTP_200_OK)
    await logger.debug(f"Lazy load data of {center}::{type}::{uid} is complete, initiating further procedure")
    
    await deps_inj_cache.json().delete(str(uid))
    feed: dict[str, list[dict[str, str]]] = {}
    for ty, slots in cdata.items():
        ty = ty.replace('%%', ' ')
        for date, val in slots.items():
            filtered_slots = filter_slot(val, serialize_stype(ty))
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
    await logger.debug("found slots at database", count=len(res), db_found=res)
    if len(res) > 1:
        await res[1].delete()
    await doc.save()
    await logger.debug("saved slot info")
