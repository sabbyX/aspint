from fastapi import APIRouter
from .config import router as config_router
from .internal import router as internal_router
from .health import router as health_router
from .serviceAPI import service_router
from .ABservice import ab_service_router

main_router = APIRouter()

main_router.include_router(config_router)
main_router.include_router(internal_router)
main_router.include_router(health_router)
main_router.include_router(service_router)
main_router.include_router(ab_service_router)

@main_router.get('/')
def home():
    return {'message': 'hello world'}

@main_router.get("/health")
def health_check():
    return {"status": "healthy"}
