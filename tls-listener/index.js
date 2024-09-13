import './intrument.js';

import { connect } from 'puppeteer-real-browser'
import { newInjectedPage } from 'fingerprint-injector';
import axios from "axios";
import {captureException} from "@sentry/node";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const auth = {
    'gbLON2be': {
        'username': 'sopadam438@ploncy.com',
        'password': 'Test@123',
        'fg_id': 1194619
    },
    'gbMNC2be': {
        'username': 'aspint.be.mnc@proton.me',
        'password': 'Test@123',
        'fg_id': 1195388
    }
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

const waitTillHTMLRendered = async (page, c, timeout = 30000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while(checkCounts++ <= maxChecks){
        let html = await page.content();
        let currentHTMLSize = html.length;

        if(lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if(countStableSizeIterations >= minStableSizeIterations) {
            console.log(c+ ": Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await sleep(checkDurationMsecs)
    }
};

const create_browser_task = async (page, c, u, p, f) => {
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    console.log(c + ' loading home page');
    await page.goto(
        `https://visas-be.tlscontact.com/visa/gb/${c}/home`,
        {waitUntil: 'networkidle0'}
    );

    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    console.log(c + ": Home Page")
    await page.waitForSelector("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a")
    await page.locator("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a").click()

    // wait for cf hops
    await page.waitForResponse(async (response) => {
        // cf does a few hops, and we want to make sure we are in the requested page
        const url = "https://auth.visas-be.tlscontact.com/auth/resources/17dei/login/web/img/favicon.ico"
        if (await response.url() === url && await response.status() === 200) {
            console.log(c+": cf hopping over. init login procedure")
            await sleep(2000)
            return true;
        }
    });
    console.log(c+": Login Page")
    await page.focus("#username");
    await page.keyboard.type(u)
    await page.focus("#password");
    await page.keyboard.type(p)
    await page.locator("#kc-login").click()
    await page.waitForNavigation({waitUntil: 'domcontentloaded'});
    console.log(c+": Finished login procedure..")

    var requests = new Map()
    await page.setRequestInterception(true);
    await page.on('requestfinished', async (request) => {
        if (!request.url().endsWith('Stage=appointment')){ return }
        const response = await request.response();
        console.log(c+ ": "+ response.url() + " " + request.redirectChain().length + " " + await response.status(), await response.statusText())
        try {
            if (request.redirectChain().length === 0 && response.ok()) {
                try {
                    const appType = new URL(response.url()).searchParams.get("appointmentType").replace(' ', '');
                    console.log(c+": Extracted " + appType)
                    requests.set(appType, await response.json())
                } catch (e) {
                    console.log(c+": non-JSON found, expected appointment table: " + await response.text() +  " "+ e.toString());
                    captureException(e);
                }
            }
        }catch (err) { console.log(err + '\n\n' + request.toString()); captureException(err)}
    });

    await page.on('request', request => {
        request.continue();
    });

    console.log(c+ ": loading appoint page")
    await page.goto(`https://visas-be.tlscontact.com/appointment/gb/${c}/${f}`)
    console.log(c+ ": appoint page loaded, proceeding to extract...");
    var reloadCount = 0;
    var maxRC = getRndInteger(4, 8);
    while (true) {
        await page.waitForResponse(async (response) => {
            return response.url().includes("prime")
        })
        await waitTillHTMLRendered(page, c);
        if (requests.size < 3) {
            console.log(c+": Expected 3 tables, got " + requests.size + " data=" + Array.from(requests).toString() + ", ignoring event");
        } else {
            console.log(c+": sending slot data to internal api...")
            const status = await axios.post(
                `http://backend:8000/internal/slotUpdate/be/${c}`, {
                    normal: requests.get('normal'),
                    prime_time: requests.get('primetime'),
                    prime_time_weekend: requests.get('primetime weekend'),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
                );
            if (status.status !== 200) {
                console.warn(c + ": internal api returned unexpected status.")
            } else {
                console.log(c+": successfully posted updated slot data to internal api")
            }
        }
        console.log(c + " sleeping...")
        await sleep(1000 * 60 * 4);
        requests.clear();
        await page.reload()
        reloadCount++;
        console.log(c+': reload count: ' + reloadCount);
        if (reloadCount >= maxRC) {
            throw "reload";
        }
    }
}

async function b_wrapper(browser, c, u, p, fid) {
    var retry = 0
    // todo: redis
    while (retry <= 3) {
        try {
            var bc = await browser.createBrowserContext()
            //var page = await bc.newPage()
            var page = await newInjectedPage(bc, {
                fingerprintOptions: {
                    devices: ['desktop'],
                    operatingSystems: ['windows']
                }
            })
            await create_browser_task(page, c, u, p, fid);
        } catch (e) {
            if (e == 'reload') {
                console.log(c+": Scheduled reload in progress...");
            } else {
                console.error(e);
                captureException(e)
                bc.close()
            }
            // retry++; failsafe
        }
    }
}

async function bg_task_tls_adv() {

    const { browser } = await connect({
        headless: false,
        args: [
            "--start-maximized",
            "--disable-backgrounding-occluded-windows",
            "--disable-background-timer-throttling",
            "--disable-renderer-backgrounding"
        ],
        customConfig: {},
        turnstile: true,
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false,
        devTools: true,
    })

    for (const center in auth) {
        b_wrapper(browser, center, auth[center].username, auth[center].password, auth[center].fg_id);
    }
}

bg_task_tls_adv()
