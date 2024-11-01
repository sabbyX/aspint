from .auth import *

# todo: cleanup/move to different files
import re
import structlog.stdlib

from redis.asyncio import Redis
from redis.commands.json.path import Path

from datetime import date, time

from ..model import Config
from ..model.appointment_table import Slot

logger = structlog.stdlib.get_logger()


async def get_app_config(cache: Redis) -> Config:
    if await cache.exists('app_config'):
        config = Config.model_validate(await cache.json().get('app_config'))
    else:
        config = await Config.find_all().first_or_none()
        config_cache = config.model_dump(exclude={'id'})
        await cache.json().set('app_config', Path.root_path(), config_cache)
    return config


def serialize_slot(d: date, t: time) -> str:
    slot = ""
    slot += d.strftime('%Y-%m-%d')
    slot += "%20"
    slot += t.strftime('%H:%M')

    return slot


def sort_feed(feed: dict[date, list[Slot]]):
    for k in feed:
        feed[k] = sorted(feed[k], key=lambda x: x.td)

    return dict(sorted(feed.items()))


def extract_center_code(center: str):
    return center[-2:]


# todo: avoid serialize
def serialize_stype(ty: str):
    match ty:
        case "prime time":
            return "pma"
        case "prime time weekend":
            return "pwma"
        case "normal":
            return "normal"
        case _:
            return ty


def filter_slot(s: dict[str, int], a_type: str) -> list[dict[str, str]]:
    return [{'td': td, 'type': a_type} for td, avail in s.items() if avail == 1]
