from typing import Annotated

from fastapi import APIRouter, Depends
from redis.asyncio import Redis

from ...cache import get_cache
from ...common import force_restart_listener
from ...model import User
from ...utils import get_current_user

router = APIRouter(prefix="/listenerRestartService")

def get_default_wid(center: str) -> str:
    if "LON" in center: return "common-1"
    elif "MNC" in center: return "common-2"
    elif "EDI" in center: return "common-3"

@router.get("/")
async def restart_service(center: str, _: Annotated[User, Depends(get_current_user)], wid: str = None, cache: Redis = Depends(get_cache)):
    if wid is None: wid = get_default_wid(center)
    return await force_restart_listener(wid, center, cache)
