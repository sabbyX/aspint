from fastapi import APIRouter, responses
from httpx import AsyncClient, TimeoutException
import structlog

logger = structlog.stdlib.get_logger()

router = APIRouter(prefix="/health")

ENDPOINT_PROXY_1 = "http://proxy-1:8000"
ENDPOINT_PROXY_2 = "http://proxy-2:8000"
ENDPOINT_PROXY_3 = "http://proxy-3:8000"
ENDPOINT_PROXY_4 = "http://proxy-4:8000"

STATUS = "/v1/openvpn/status"
IP = "/v1/publicip/ip"


@router.get("/proxy")
async def proxy_server_health_check() -> responses.JSONResponse:
    await logger.debug("Recieved healthcheck for proxy servers")
    resp = {}

    resp[1] = await __int_eval_status(ENDPOINT_PROXY_1)
    resp[2] = await __int_eval_status(ENDPOINT_PROXY_2)
    resp[3] = await __int_eval_status(ENDPOINT_PROXY_3)
    resp[4] = await __int_eval_status(ENDPOINT_PROXY_4) 

    return responses.JSONResponse(resp)


async def __int_eval_status(endpoint):
    try:
        async with AsyncClient() as client:
            _raw = await client.get(endpoint + STATUS)
            status = _raw.json()['status']

            ipdata = await client.get(endpoint + IP)
    except TimeoutException:
        status = "failed"
        ipdata = ""
    
    return {"status": status, "ipdata": ipdata.json()}
