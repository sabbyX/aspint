from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI

from .model import __beanie_models__

logger = structlog.stdlib.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[FastAPI, None]:
    await logger.debug('Lifespan startup initiated')
    try:
        client = AsyncIOMotorClient("mongodb://user:psw@db:27017/")
    except Exception as e:
        await logger.exception("Failed to connect to MongoDB. Critical")
    else:
        await logger.info('MongoDB connection established', client=await client.server_info())
        await init_beanie(
            database=client['aspint'], document_models=__beanie_models__
        )

    yield

    # shutdown
