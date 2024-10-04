from sys import prefix
from typing import Annotated

from fastapi import APIRouter, Depends
from ...model import User
from ...utils import get_current_user

router = APIRouter(prefix="/accounts")

@router.get("/me")
async def me(current_user: Annotated[User, Depends(get_current_user)]):
    json_user = current_user.model_dump(exclude={'id', 'hashed_password'})
    return json_user
