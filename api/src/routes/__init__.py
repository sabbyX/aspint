from fastapi import APIRouter
from .instance_control import router as instance_router

main_router = APIRouter()

main_router.include_router(instance_router)


@main_router.get('/')
def home():
    return {'message': 'hello world'}
