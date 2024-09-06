import re
import structlog.stdlib
from playwright.async_api import Page, Response

from redis.asyncio import Redis
from redis.commands.json.path import Path

from datetime import date, time

from .model import Config

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
