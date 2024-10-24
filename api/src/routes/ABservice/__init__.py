from fastapi import APIRouter
from .new_application import router as new_application_router


ab_service_router = APIRouter(prefix="/autobookService")
ab_service_router.include_router(new_application_router)
