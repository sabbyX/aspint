from datetime import timedelta, datetime, timezone
from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext

from ...model import User
from ...utils import SECRET_KEY, ACCESS_TOKEN_EXPIRE_HOURS, ALGO

router = APIRouter(prefix="/authenticate")



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Token(BaseModel):
    access_token: str
    token_type: str


def __int_verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)

def __int_get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)


async def __int_get_user(username: str) -> User | None:
    user = await User.find_one(User.username == username)
    return user


async def __int_authenticate_user(username: str, password: str) -> User | bool:
    user = await __int_get_user(username)
    if not user:
        return False
    if not __int_verify_password(password, user.hashed_password):
        return False
    return user


def __int_gen_access_token(user: User, expires_delta: timedelta | None = None) -> str:
    to_encode = {"sub": user.username}
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire.timestamp()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGO)
    return encoded_jwt



@router.post("/")
async def authenticate(payload: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = await __int_authenticate_user(payload.username, payload.password)
    if payload.username == "dev@dev.dev":  # DEV ONLY!!! REMOVE IN PROD !!!  TODO
        user = User(username="dev", hashed_password=__int_get_hashed_password('dev'), name="dev")
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    access_token_expiry = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = __int_gen_access_token(user, expires_delta=access_token_expiry)
    return Token(access_token=access_token, token_type="bearer")
