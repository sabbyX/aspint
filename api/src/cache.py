import structlog.stdlib
from redis.asyncio import Redis
from .config.db import pool

logger = structlog.stdlib.get_logger()


async def get_cache() -> Redis:
    return Redis(connection_pool=pool)
