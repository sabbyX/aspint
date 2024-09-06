import asyncio
import re
from datetime import timedelta

import httpx
import pymongo
import structlog
from fastapi import APIRouter, Depends, BackgroundTasks, responses
from playwright.async_api import async_playwright, Response
from playwright_recaptcha.recaptchav3 import AsyncSolver
from redis.asyncio import Redis

from ..cache import get_cache
from ..model import NewApplication, AvailableSlotTable, AppointmentTable
from pydantic import BaseModel, EmailStr
from typing import Literal

from ..tlshelper import TlsHelper, retry_wrapper
from ..utils import get_app_config, serialize_slot

logger: structlog.stdlib.BoundLogger = structlog.get_logger()


router = APIRouter(
    prefix='/instance'
)


async def __bg_task_new_app(data: NewApplication, deps_inj_cache: Redis):
    await logger.debug('executing bg tasks for new application', data=data)
    assert data.slot_check_only

    async with (async_playwright() as playwright):
        browser = await playwright.firefox.launch()
        page = await browser.new_page()
        await page.goto(f'https://visas-ch.tlscontact.com/visa/gb/{data.issuer}/home')
        await logger.debug('Home Page', email=data.email)
        await page.goto('https://visas-ch.tlscontact.com/oauth2/authorization/oidc')
        await page.get_by_label("Email").fill(data.email)
        await page.get_by_label("Password").fill(data.password)
        await page.get_by_role('button', name='Log in').click()
        await logger.debug('Auth in progress', email=data.email)
        resp = await retry_wrapper(
            page.context.request.get,
            'https://visas-ch.tlscontact.com/api/account'
        )
        if resp.status != 200:
            raise Exception(f"Failed API Request: {resp.text}")
        else:
            await logger.debug('Auth success', email=data.email)
            fg_id = await TlsHelper.get_fg_id(page.context, data.issuer)
            async with TlsHelper(fg_id, data.issuer) as tls:
                retry = 0  # todo: make it custom
                while True:
                    try:
                        await logger.debug('checking slot')
                        sleep_interval = await get_app_config(deps_inj_cache)
                        slots2 = await tls.check_slots(
                            page.context,
                            allow_pma=True if data.slot_check_only else data.prime_time_appointment,
                            allow_pmwa=True if data.slot_check_only else data.prime_time_weekend_appointment,
                        )

                        if len(slots2) > 0 and not data.slot_check_only:
                            break
                        elif len(slots2) < 1:
                            logger.debug("No slot found")
                            await asyncio.sleep(sleep_interval.refresh_interval)
                            continue

                        await logger.debug("slot_check_only - starting process to update database")
                        if data.slot_check_only:
                            # feed = AvailableSlotTable.model_validate({'slots_available': slots2})
                            doc = AppointmentTable(issuer="ch", center=data.issuer, slots_available=slots2)
                            res: list[AppointmentTable] = await AppointmentTable.find(
                                AppointmentTable.issuer == "ch",
                                AppointmentTable.center == data.issuer,
                            ).sort(
                                [
                                    (AppointmentTable.id, pymongo.DESCENDING)
                                ]
                            ).to_list()
                            await logger.debug("found slots at database", count=len(res), db_found=res)
                            if len(res) > 1:
                                await res[1].delete()
                            await doc.save()
                            await logger.debug("saved updated slot info, sleeping")
                            await asyncio.sleep(sleep_interval.refresh_interval)
                    except Exception as e:
                        logger.exception("bg task failed with ")
                        if retry > 3:  # make retry expiry
                            raise e
                        else:
                            await logger.awarning("bg task failed with exception, restarting bg_task", retry=retry+1)

                return

                # await logger.debug('Selecting slot')
                # feed = AvailableSlotTable.model_validate({'slots_available': slots2})
                # d, t = next(iter(feed.slots_available.items()))
                # selected_slot = serialize_slot(d, next(iter(t)))
                # if data.preferred_slot_range:
                #     for date, slot_times in feed.slots_available.items():
                #         if data.date_range.from_date >= date >= data.date_range.from_date:
                #             selected_slot = serialize_slot(d, next(iter(slot_times)))
                #             break
                # await logger.debug('Slot selected', selected_slot=selected_slot)
                # await logger.debug('Appointment Booking Stage', fg_id=fg_id)
                # async with page.expect_response(
                #  lambda r: r.url.find("recaptcha/api2/anchor") != -1 and r.status == 200 and r.request.method == "GET"
                # ) as raw_resp_inf:
                #     await page.goto(
                #         f'https://visas-ch.tlscontact.com/appointment/gb/{data.issuer}/{fg_id}',
                #         wait_until='networkidle'
                #     )
                #     await logger.debug('Loaded Appointment Page, capturing grecaptcha-token', fg_id=fg_id)
                # token_info_val = await raw_resp_inf.value
                # token_info_resp = await token_info_val.text()
                # await logger.debug('Capturing token', fg_id=fg_id)
                # token = re.search(r'id="recaptcha-token" value="([^"]+)"', token_info_resp)
                # if token is None:
                #     raise Exception("Expected recaptcha-token")
                # token = token.group(1)
                # await logger.debug('token captured', token=token, fg_id=fg_id)
                # try:
                #     rsp = await tls.book(page.context, selected_slot, token)
                # except Exception as e:
                #     await logger.exception('e')
                #     raise e
                # await logger.debug("Booked", resp=rsp)
                # return responses.Response(content=await page.screenshot(full_page=True), media_type='image/png')

@router.post("/new-application")
async def new_application(
        data: NewApplication,
        _bg_tasks: BackgroundTasks,
        deps_inj_cache: Redis = Depends(get_cache),
):
    await logger.info('Received request to create a new application', data=data)
    _bg_tasks.add_task(__bg_task_new_app, data, deps_inj_cache)
    return responses.JSONResponse({'status': 'Application Queued Successfully', 'status_code': '200'})
