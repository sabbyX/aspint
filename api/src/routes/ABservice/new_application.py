import datetime
from typing import Annotated, Literal, Optional

import structlog.stdlib
from fastapi import APIRouter, Depends, responses
from pydantic import BaseModel, EmailStr
from pymongo.errors import DuplicateKeyError
from starlette.responses import JSONResponse

from ...model import User, ABApplication, IntABApplicationDateRange
from ...utils import get_current_user

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/newApplication")

class NewApplicationPayload(BaseModel):
    issuer: Literal["be", "fr", "de", "ch"]
    center: Literal["London", "Manchester", "Edinburgh"]
    email: EmailStr
    password: str
    formid: int
    dateRange: Optional[IntABApplicationDateRange] = None
    preferredSlotRange: bool
    primeTimeAppointment: bool
    primeTimeWeekendAppointment: bool

def gen_center_code(issuer: str, center: str):
    center_code_f = "gb{center_code}2{issuer}"
    if center == "london":
        center_code = "LON"
    elif center == "manchester":
        center_code = "MNC"
    else:
        center_code = "EDI"

    return center_code_f.format(center_code=center_code.upper(), issuer=issuer.lower())


@router.post("/")
async def new_application(_: Annotated[User, Depends(get_current_user)], payload: NewApplicationPayload) -> responses.JSONResponse:
    db_entry = ABApplication(
        email=payload.email,
        password=payload.password,
        formid=payload.formid,
        date_range=payload.dateRange,
        allowPremium=payload.primeTimeAppointment or payload.primeTimeWeekendAppointment,
        issuer=payload.issuer,
        center=gen_center_code(payload.issuer.lower(), payload.center.lower()),
    )
    try:
        await db_entry.insert()
    except DuplicateKeyError:
        return JSONResponse({"error": "duplicate application"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
    return JSONResponse({"status": "ok"})
