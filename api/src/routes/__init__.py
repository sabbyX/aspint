from fastapi import APIRouter
from .instance_control import router as instance_router
from .config import router as config_router

main_router = APIRouter()

main_router.include_router(instance_router)
main_router.include_router(config_router)


@main_router.get('/')
def home():
    return {'message': 'hello world'}
