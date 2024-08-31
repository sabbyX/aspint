import asyncio

from typing import List, Optional, Literal, Awaitable, Any, Callable

from loguru import logger
from playwright.async_api import APIResponse, Cookie, BrowserContext


async def retry_wrapper(coro: Callable[..., Awaitable[Any]], *args, **kwargs) -> APIResponse:
    resp_status = retry = resp = 0

    while resp_status != 200 and retry < 5:
        resp = await coro(*args, **kwargs)
        retry = retry + 1

        if resp_status != 0:
            await asyncio.sleep(1)

        logger.debug('')

    return resp


def handle_response_error(
        response: APIResponse, cookies: List[Cookie], xsrf_token: str, message: str, suppress=False
) -> None:
    logger.error(f'{message}. Error: {response.status_text}')
    if not suppress:
        raise Exception(
            f"Failed to get available slots | "
            f"{response.status}\n: {response.text}\n: {cookies}\n: {xsrf_token}\n"
        )


async def appointment_table_request_gen(
        context: BrowserContext,
        api: str,
        appointment_type: Literal['normal', 'prime time', 'prime time weekend'],
        fg_id: int,
        xsrf_token: str
) -> APIResponse:
    logger.debug("GET Request to retrieve available appointment slots")
    response = await retry_wrapper(
        context.request.get,
        api,
        params={
            'client': 'ch',  # todo: abstraction
            'formGroupId': fg_id,
            'appointmentType': appointment_type,
            'appointmentStage': 'appointment',
        },
        headers={
            'x-xsrf-token': xsrf_token,
        }
    )

    return response


def extract_xsrf_token(cookies: List[Cookie]) -> Optional[str]:
    logger.debug("Extracting XSRF token")
    return next((cookie.get('value') for cookie in cookies if cookie.get('name') == 'XSRF-TOKEN'), None)


class IncompleteApplicationError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
