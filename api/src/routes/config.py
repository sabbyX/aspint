import structlog.stdlib
from fastapi import APIRouter, status
from src.model import Config

logger = structlog.stdlib.get_logger()

router = APIRouter(
    prefix="/config",
)


@router.get('/get', response_model=Config)
async def get_config() -> Config:
    await logger.debug("GET Request for /config/get")
    config = await Config.find().first_or_none()
    await logger.debug("Config retrieved", config=config)
    return config


@router.post('/set', status_code=status.HTTP_201_CREATED)
async def set_config(data: Config):
    await logger.debug("SET Request for /config/set", new_config=data)
    await Config.insert(data)
    return {'config': data}
