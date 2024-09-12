import pymongo
from fastapi import APIRouter, responses, status
import structlog

from ..model import TlsAdvListerSlotUpdate, AppointmentTable
from ..tlshelper import filter_slot

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/internal")


@router.post("/slotUpdate/{country}/{center}")
async def slot_update(country: str, center: str, data: TlsAdvListerSlotUpdate):
    await logger.debug("Received data from tls advanced listener")
    feed: dict[str, list[dict[str, str]]] = {}

    await logger.debug(f"Normal slots: {len(data.normal)}")
    for date, val in data.normal.items():
        filtered_slots = filter_slot(val, 'normal')
        if len(filtered_slots) > 0:
            feed[date] = filtered_slots

    await logger.debug(f"Prime Time slots: {len(data.prime_time)}")
    for date, val in data.prime_time.items():
        if date not in feed:
            feed[date] = filter_slot(val, 'pma')
        else:
            feed[date].extend(filter_slot(val, 'pma'))

    await logger.debug(f"Prime Time Weekend slots: {len(data.prime_time_weekend)}")
    for date, val in data.prime_time_weekend.items():
        if date not in feed:
            feed[date] = filter_slot(val, 'pmwa')
        else:
            feed[date].extend(filter_slot(val, 'pmwa'))

    if len(feed) > 0:
        if data.slot_check_only:
            doc = AppointmentTable(issuer=country, center=center, slots_available=feed)
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

    return responses.Response(status_code=status.HTTP_200_OK)
