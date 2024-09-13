import structlog.stdlib
from fastapi import APIRouter, Depends, responses, status
from redis.asyncio import Redis
from redis.commands.json.path import Path

from src.model import Config
from src.cache import get_cache

logger = structlog.stdlib.get_logger()

router = APIRouter(
    prefix="/config",
)


@router.get('/get', response_model=Config)
async def get_config(
        deps_inj_cache: Redis = Depends(get_cache)
) -> Config:
    await logger.debug("GET Request for /config/get")
    if await deps_inj_cache.exists('app_config'):
        config = await deps_inj_cache.json().get('app_config')
    else:
        config = await Config.find_all().first_or_none()
        config_cache = config.model_dump(exclude={'id'})
        await deps_inj_cache.json().set('app_config', Path.root_path(), config_cache)
    await logger.debug("Config retrieved", config=config)
    return config


@router.post('/set', status_code=status.HTTP_201_CREATED)
async def set_config(data: Config, dep_inj_cache: Redis = Depends(get_cache)):
    await logger.debug("SET Request for /config/set", new_config=data)
    data.id = None
    await Config.insert(data)
    await dep_inj_cache.json().set('app_config', Path.root_path(), data.model_dump(exclude={'id'}))
    return responses.JSONResponse({'config': data.model_dump(exclude={'id'})})
