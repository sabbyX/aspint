import httpx
from fastapi import APIRouter
from playwright.async_api import async_playwright

from ..model import NewApplication
from pydantic import BaseModel, EmailStr
from typing import Literal

from ..tlshelper import TlsHelper, retry_wrapper


router = APIRouter(
    prefix='/instance'
)


@router.post("/new-application")
async def new_application(data: NewApplication):
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        page = await browser.new_page()
        await page.goto('https://visas-ch.tlscontact.com/visa/gb/gbLON2ch/home')
        await page.goto('https://visas-ch.tlscontact.com/oauth2/authorization/oidc')
        await page.get_by_label("Email").fill(data.email)
        await page.get_by_label("Password").fill(data.password)
        await page.get_by_role('button', name='Log in').click()

        resp = await retry_wrapper(
            page.context.request.get,
            'https://visas-ch.tlscontact.com/api/account'
        )
        if resp.status != 200:
            raise Exception(f"Failed API Request: {resp.text}")
        else:
            fg_id = await TlsHelper.get_fg_id(page.context, 'gbMNC2ch')
            async with TlsHelper(fg_id, 'gbMNC2ch') as tls:
                slots = await tls.check_slots(page.context)
                print(slots)
