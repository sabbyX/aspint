import sys

import uvicorn
from fastapi import FastAPI
from loguru import logger
from starlette.middleware.cors import CORSMiddleware

from src.routes import main_router

logger.add(sys.stderr, level="DEBUG", diagnose=True)


app = FastAPI(
    title="AspInt API",
    version="0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(main_router)


if __name__ == '__main__':
    uvicorn.run(app, host="localhost", port=8000, log_level='debug')
