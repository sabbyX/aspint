from typing import Literal

import structlog.stdlib
from pydantic import BaseModel, Field
from httpx import AsyncClient

from ...model import ABHealth, IntABHealthQData

logger = structlog.stdlib.get_logger()


AB_SERVICE_SERVER = "http://localhost:9000"

HEALTH_MSGS = {
    200: "Success",

    90: "Waiting for available slot",
    91: "Slot found, waiting for available autobook server",
    92: "AB Server selected",

    100: "Initializing AB service",
    101: "Initialization Complete",
    110: "Logging into account",
    111: "Logging in finished",
    120: "Loading appointment page",

    430: "CAF Block, Change IP/VPN/Account",
    440: "Failed to pass recaptcha bot score",

    500: "Encountered Error:"
}


async def set_ab_health(formid: int, health_code: int, health_msg: str = None):
    """
Health codes
    200: "Success",

    90: "Waiting for available slot",
    91: "Slot found, waiting for available autobook server",
    92: "AB Server selected",

    100: "Initializing AB service",
    101: "Initialization Complete",
    110: "Logging into account",
    111: "Logging in finished",
    120: "Loading appointment page",

    430: "CAF Block, Change IP/VPN/Account",
    440: "Failed to pass recaptcha bot score",

    500: "Encountered Error:"

500: Other errors
"""
    if health_msg is None: health_msg = HEALTH_MSGS[health_code]
    doc = await ABHealth.find_one(ABHealth.formid == formid)
    if doc is None:
        doc = ABHealth(formid=formid, logs=[IntABHealthQData(status=health_code, message=health_msg)])
    else:
        doc.logs.append(IntABHealthQData(status=health_code, message=health_msg))

    r = await doc.save()
    await logger.debug("updated ab health")


async def get_ab_health(formid: int):
    doc = await ABHealth.find_one(ABHealth.formid == formid)
    return doc


class ABQueuePayload(BaseModel):
    token: str = Field(default="0474c34e77c434ccffd32f457becc89f74fb0f975a9064eac241199810bddf51")
    username: str
    password: str
    formId: int
    country: Literal["be", "ch", "de", "fr"]
    center: str
    slot: str
    slotType: str


async def autobook_queue(payload: ABQueuePayload):
    await logger.debug("p: ", p=payload)
    async with AsyncClient() as client:
        await logger.debug("sending new application AB server")
        try:
            resp = await client.post(AB_SERVICE_SERVER, json=payload.model_dump())
            if resp.status_code != 200:
                await logger.debug("AB server failed with message: ", message=resp.json())
                return False, resp.json()
        except Exception as e:
            await logger.debug(f"AB server connection failed, error={str(e)}")
            return False, str(e)
        return True, resp.json()
