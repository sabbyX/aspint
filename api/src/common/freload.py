from datetime import timedelta
from fastapi import responses, status
from redis.asyncio import Redis

FRELOAD_KEY = "freload:{}:{}"

async def force_restart_listener(wid: str, center: str, cache: Redis) -> responses.HTMLResponse:
    await cache.set(FRELOAD_KEY.format(wid, center), 1, ex=timedelta(minutes=10))
    return responses.HTMLResponse(status_code=status.HTTP_200_OK)

