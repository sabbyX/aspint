from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt import InvalidTokenError

from ..model import User

SECRET_KEY = "56b0d4468a687801564a4541df91467cc869e78283cf15f552c6a48fb01a094f"
ALGO = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/authenticate")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Unauthorized"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGO])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    if username == "dev":  # REMOVE!!! DEV!!! TODO
        return User(username="dev", hashed_password="", name="dev")
    user = await User.find_one(User.username == username)
    if user is None:
        raise credentials_exception
    return User
