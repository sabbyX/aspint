import logging
from typing import Literal, Dict, List

from loguru import logger
from playwright.async_api import BrowserContext

from .utils import retry_wrapper, IncompleteApplicationError, extract_xsrf_token, handle_response_error, \
    appointment_table_request_gen

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
        return self

    async def check_slots(self, context: BrowserContext, allow_pma=False, allow_pmwa=False):
        logger.debug(f"Checking available slots for {self.fg_id}: {self.issuer}: pma={allow_pma}: pmwa={allow_pmwa}")
        # todo: possible abstraction of client 'gb'
        api = f"{base_api_url}/appointment/gb/{self.issuer}/table"
        xsrf_token = extract_xsrf_token(await context.cookies())

        logger.debug(f"xsrf_token: {xsrf_token}")
        response = await appointment_table_request_gen(
            context, api, 'normal', self.fg_id, xsrf_token
        )
        logger.debug(f"Response: code={response.status} text={response.text}")
        if response.status != 200:
            handle_response_error(
                response, await context.cookies(), xsrf_token, "Failed to get normal appointment table"
            )

        # expected response
        # {<date format: YYYY/MM/DD> {<hr HH:MM>: 0/1}}
        available_slots = {}
        data: Dict[str, Dict[str, int]] = await response.json()
        logger.debug(f"Available slots for {self.fg_id} [raw]: {data}")
        for date, val in data.items():
            filtered_slots = {slot: avail for slot, avail in val.items() if avail == 1}
            if len(filtered_slots) > 0:
                available_slots[date] = filtered_slots
        logger.debug(f"Available normal slots for {self.fg_id}: {available_slots}")

        if allow_pma:
            logger.debug(f"Checking PMA slots for {self.fg_id}: {available_slots}")
            response = await appointment_table_request_gen(
                context, api, 'prime time', self.fg_id, xsrf_token
            )
            logger.debug(f"Response: code={response.status} text={response.text}")
            if response.status != 200:
                handle_response_error(
                    response,
                    await context.cookies(),
                    xsrf_token,
                    "Failed to get prime time appointment table",
                    suppress=True
                )
            else:
                data = await response.json()
                logger.debug(f"PMA slots received for {self.fg_id}: {data}")
                for date, val in data.items():
                    if date not in available_slots:
                        available_slots[date] = {slot: avail for slot, avail in val.items() if avail == 1}
                    else:
                        available_slots[date].update({slot: avail for slot, avail in val.items() if avail == 1})

        elif allow_pmwa:
            logger.debug(f"Checking PMWA slots for {self.fg_id}")
            response = await appointment_table_request_gen(
                context, api, 'prime time weekend', self.fg_id, xsrf_token
            )
            logger.debug(f"Response: code={response.status} text={response.text}")
            if response.status != 200:
                handle_response_error(
                    response, await context.cookies(), xsrf_token,
                    "Failed to get prime time weekend appointment table", suppress=True
                )
            else:
                data = await response.json()
                logger.debug(f"PMWA slots received for {self.fg_id}: {data}")
                for date, val in data.items():
                    if date not in available_slots:
                        if date not in available_slots:
                            available_slots[date] = {slot: avail for slot, avail in val.items() if avail == 1}
                        else:
                            available_slots[date].update({slot: avail for slot, avail in val.items() if avail == 1})
        logger.debug(f"Final computed available slots for {self.fg_id}: {available_slots}")
        return available_slots

    @staticmethod
    async def get_fg_id(context: BrowserContext, issuer: Literal['gbLON2ch', 'gbEDI2ch', 'gbMNC2ch']) -> int:
        api = f"{base_api_url}/formgroup"
        response = await retry_wrapper(
            context.request.get,
            api,
            params={
                'client': 'ch',
                'issuer': issuer,
            },
        )

        if not response.ok:
            logger.error(f"Failed to retrieve fg_id. error: {response.text}")
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
        if len(data) == 0:
            logging.error('No form group found. aborting')
            raise IncompleteApplicationError("No form group found")

        if len(data) > 1:
            logging.warning(f"get_fg_id: Expected single form group, got {len(data)+1}. first group will be considered")

        fg = data[0]
        fg_id = fg['fg_id']
        return int(fg_id)
