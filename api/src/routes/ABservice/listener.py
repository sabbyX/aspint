import datetime
from typing import Optional, Tuple
from copy import deepcopy

import structlog.stdlib
from motor.motor_asyncio import AsyncIOMotorChangeStream, AsyncIOMotorDatabase
from beanie.operators import Set

from .common import autobook_queue, ABQueuePayload, set_ab_health
from ...model import ABApplication, AppointmentTable, IntABApplicationDateRange, ABListener1ResumeToken

logger = structlog.stdlib.get_logger()


class IntPrefSlotData:
    slot: str
    slotType: str

    def __init__(self, slot_date: datetime.date, slot_time: datetime.time, slot_type: str):
        date = slot_date.strftime('%Y-%m-%d')
        time = slot_time.strftime('%H:%M')

        self.slot = f"{date} {time}"
        self.slotType = slot_type


async def get_pref_slot_available(issuer: str, center: str, date_range: Optional[IntABApplicationDateRange] = None, allow_premium = True) -> Tuple[bool, Optional[IntPrefSlotData]]:
    tables: list[AppointmentTable] = await AppointmentTable.find(
        AppointmentTable.issuer == issuer,
        AppointmentTable.center == center
    ).sort(
        [
            (AppointmentTable.id, -1)
        ]
    ).to_list()

    latest_table = tables[0]
    if len(latest_table.slots_available) > 0:
        if not date_range and allow_premium:
            pref_date, pref_slots = next(iter(latest_table.slots_available.items()))
            return True, IntPrefSlotData(pref_date, pref_slots[0].td, pref_slots[0].type)

        available_range = latest_table.slots_available.copy()
        if not allow_premium:
            for date, slots in deepcopy(available_range).items():  # todo: avoid deepcopy
                for slot in slots:
                    if slot.type.lower() not in ["normal", "short_stay"]:  # incomplete
                        available_range[date].remove(slot)
                if len(available_range[date]) < 1:
                    available_range.pop(date)

        if date_range:
            await logger.debug("checking if slot available in pref date range", date_range=date_range)
            for date in available_range:
                if date_range.from_ <= date <= date_range.to:
                    await logger.debug(f"found pref date match: {date}")
                    slots = available_range.get(date)
                    await logger.debug("slots: ", slots)
                    return True, IntPrefSlotData(date, slots[0].td, slots[0].type)
            else: return False, None

        if len(available_range) > 0:
            pref_date, pref_slots = next(iter(available_range.items()))
            return True, IntPrefSlotData(pref_date, pref_slots[0].td, pref_slots[0].type)
    return False, None


async def __int_upd_res_tok(res_tok):
    return await ABListener1ResumeToken.find_one(ABListener1ResumeToken.listener == "aspint").upsert(
        Set({ABListener1ResumeToken.resume_token: res_tok}),
        on_insert=ABListener1ResumeToken(resume_token=res_tok)
    )


async def ab_active_listener(db: AsyncIOMotorDatabase):
    await logger.debug("AB New Application Listener ACTIVE")

    collection = db['autobook_applications']
    pipeline = [{'$match': {'operationType': 'insert'}}]
    while True:
        try:
            resume_token = await ABListener1ResumeToken.find_one()
            if resume_token is not None: resume_token = resume_token.resume_token
            async with collection.watch(pipeline, resume_after=resume_token) as stream:  # type: AsyncIOMotorChangeStream
                async for item in stream:
                    await logger.debug("Received new AB application")

                    application = ABApplication.model_validate(item['fullDocument'])
                    available, pref_slot = await get_pref_slot_available(application.issuer, application.center, application.date_range, allow_premium=application.allowPremium)
                    if not available:
                        await logger.debug("No available slots found, transferring application to passive listener")
                        await __int_upd_res_tok(stream.resume_token)
                        await set_ab_health(application.formid, 90)
                        continue
                    ok, msg = await autobook_queue(
                        ABQueuePayload(
                            username=application.email,
                            password=application.password,
                            formId=application.formid,
                            center=application.center,
                            country=application.issuer,
                            slot=pref_slot.slot,
                            slotType=pref_slot.slotType,
                        )
                    )
                    if not ok:
                        await logger.debug("AB server returned with unexpected result, transferring application to passive listener")
                        await __int_upd_res_tok(stream.resume_token)
                        await set_ab_health(application.formid, 90)
                        continue

                await __int_upd_res_tok(stream.resume_token)
        except Exception:
            await logger.exception("AB active listener encountered unexpected error: ")
            continue
