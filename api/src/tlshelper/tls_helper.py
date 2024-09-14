import logging
from typing import Literal, Dict, List

import structlog
from playwright.async_api import BrowserContext
from httpx import AsyncClient

from .utils import retry_wrapper, IncompleteApplicationError, extract_xsrf_token, handle_response_error, \
    appointment_table_request_gen, extract_cookie_value, filter_slot
from ..model.appointment_table import Slot

logger: structlog.stdlib.BoundLogger = structlog.get_logger()
base_api_url = "https://visas-ch.tlscontact.com/services/customerservice/api/tls"


class TlsHelper:
    issuer: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch']
    fg_id: int

    def __init__(
            self,
            fg_id: int,
            issuer: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch'],
    ):
        self.fg_id = fg_id
        self.issuer = issuer

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await logger.exception(exc_type, exc_val, exc_tb)
        return self

    async def check_slots(self, context: BrowserContext, allow_pma=False, allow_pmwa=False):
        await logger.debug(
            f"Checking available slots for {self.fg_id}: {self.issuer}: pma={allow_pma}: pmwa={allow_pmwa}"
        )
        # todo: possible abstraction of client 'gb'
        api = f"{base_api_url}/appointment/gb/{self.issuer}/table"
        xsrf_token = await extract_xsrf_token(await context.cookies())

        await logger.debug(f"xsrf_token: {xsrf_token}")
        response = await appointment_table_request_gen(
            context, api, 'normal', self.fg_id, xsrf_token
        )
        await logger.debug(f"Response: code={response.status} text={response.text}")
        if response.status != 200:
            await handle_response_error(
                response, await context.cookies(), xsrf_token, "Failed to get normal appointment table"
            )

        # expected response
        # {<date format: YYYY/MM/DD> {<hr HH:MM>: 0/1}}
        available_slots: dict[str, list[dict[str, str]]] = {}
        data: Dict[str, Dict[str, int]] = await response.json()
        await logger.debug(f"Available slots for {self.fg_id} [raw]: {data}")
        for date, val in data.items():
            filtered_slots = filter_slot(val, 'normal')
            if len(filtered_slots) > 0:
                available_slots[date] = filtered_slots
        await logger.debug(f"Available normal slots for {self.fg_id}: {available_slots}")

        if allow_pma:
            await logger.debug(f"Checking PMA slots for {self.fg_id}: {available_slots}")
            response = await appointment_table_request_gen(
                context, api, 'prime time', self.fg_id, xsrf_token
            )
            await logger.debug(f"Response: code={response.status} text={response.text}")
            if response.status != 200:
                await handle_response_error(
                    response,
                    await context.cookies(),
                    xsrf_token,
                    "Failed to get prime time appointment table",
                    suppress=True
                )
            else:
                data = await response.json()
                await logger.debug(f"PMA slots received for {self.fg_id}: {data}")
                for date, val in data.items():
                    filtered_slots = filter_slot(val, 'pma')
                    if len(filtered_slots) > 0:
                        if date not in available_slots:
                            available_slots[date] = filter_slot(val, 'pma')
                        else:
                            available_slots[date].extend(filter_slot(val, 'pma'))

        elif allow_pmwa:
            await logger.debug(f"Checking PMWA slots for {self.fg_id}")
            response = await appointment_table_request_gen(
                context, api, 'prime time weekend', self.fg_id, xsrf_token
            )
            await logger.debug(f"Response: code={response.status} text={response.text}")
            if response.status != 200:
                await handle_response_error(
                    response, await context.cookies(), xsrf_token,
                    "Failed to get prime time weekend appointment table", suppress=True
                )
            else:
                data = await response.json()
                await logger.debug(f"PMWA slots received for {self.fg_id}: {data}")
                for date, val in data.items():
                    filtered_slots = filter_slot(val, 'pmwa')
                    if len(filtered_slots) > 0:
                        if date not in available_slots:
                            available_slots[date] = filter_slot(val, 'pmwa')
                        else:
                            available_slots[date].extend(filter_slot(val, 'pmwa'))

        await logger.debug(f"Final computed available slots for {self.fg_id}: {available_slots}")
        return available_slots

    async def book(self, context: BrowserContext, selected_slot: str, recaptcha_token: str):  # todo: update
        try:
            api = \
                (f"https://visas-ch.tlscontact.com/services/customerservice/api/tls/appointment/book"
                 f"?client=ch&issuer={self.issuer}&formGroupId={self.fg_id}&timeslot={selected_slot}"
                 f"&appointmentType=normal&accountType=INDI&lang=en-us")
            xsrf_token = await extract_xsrf_token(await context.cookies())
            async with AsyncClient() as httpx_client:
                resp = await httpx_client.post(
                    api,
                    cookies={
                        'JSESSIONID': await extract_cookie_value(await context.cookies(), 'JSESSIONID'),
                        'XSRF-TOKEN': xsrf_token
                    },
                    headers={
                        'X-XSRF-TOKEN': xsrf_token,
                        'recaptcha-token': recaptcha_token
                    }
                )

        except Exception as e:
            await logger.exception('e')
            raise e
        print(resp, resp.status_code, resp.text)
        return resp

    @staticmethod
    async def get_fg_id(context: BrowserContext, issuer: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch']) -> int:
        api = f"{base_api_url}/formgroup"
        await logger.debug('Retrieving fg_id')
        response = await retry_wrapper(
            context.request.get,
            api,
            params={
                'client': 'ch',
                'issuer': issuer,
            },
        )
        await logger.debug(f"GET Req {api} Response: code={response.status} text={response.text}")
        if not response.ok:
            await logger.error(f"Failed to retrieve fg_id. error: {response.text}")
            raise TimeoutError(
                f"Failed to retrieve fg_id. | {response.status}: {response.text()}: {await context.cookies()}"
            )

        # sample/expected response
        # [
        #     {
        #         "fg_id": <fg id>,
        #         "fg_name": "default group",
        #         "fg_application_path": "vac",
        #         "fg_process": "schengen_vac",
        #         "fg_xref_u_id": "<1132455>",
        #         "fg_is_anonymised": false,
        #         "fg_tech_deleted": false,
        #         "fg_tech_creation": "<creation datetime>",
        #         "fg_is_purged": false
        #     }
        # ]
        data: List[Dict[str, str | bool]] = await response.json()
        await logger.debug(f'Received data for fg_id = {data}')
        if len(data) == 0:
            logging.error('No form group found. aborting')
            raise IncompleteApplicationError("No form group found")

        if len(data) > 1:
            logging.warning(f"get_fg_id: Expected single form group, got {len(data)+1}. first group will be considered")

        fg = data[0]
        fg_id = fg['fg_id']

        await logger.debug(f'Retrieved fg_id {fg_id}')

        return int(fg_id)
