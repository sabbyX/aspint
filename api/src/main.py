import structlog
import sentry_sdk

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from src.lifespan import lifespan
from src.logger import configure_logger
from src.routes import main_router

sentry_sdk.init("https://54e5e308c6ddc16198730f94c2a3f864@o389497.ingest.us.sentry.io/4507938115944448")
configure_logger()

logger = structlog.stdlib.get_logger()

app = FastAPI(
    title="AspInt API",
    version="0.2",
    lifespan=lifespan,
    debug=True,
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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: Exception):
    exc_str = f'{exc}'.replace('\n', ' ').replace('   ', ' ')
    await logger.error(f"{request}: {exc_str}")
    content = {'status_code': 500, 'message': exc_str, 'data': None}
    return JSONResponse(content=content, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
