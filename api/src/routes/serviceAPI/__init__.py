from fastapi import APIRouter
from .auth import router as auth_router
from .account import router as  acc_router

service_router = APIRouter(prefix="/service")
service_router.include_router(auth_router)
service_router.include_router(acc_router)
