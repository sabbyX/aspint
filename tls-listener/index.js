// import './intrument.js';
import {getHomePage, apPage, cfHopRq, tableC1, tableC2, tableC3, cfHopRq2} from './link.js'

import { connect } from 'puppeteer-real-browser'
import pkg from 'ghost-cursor';
const { getRandomPagePoint, installMouseHelper } = pkg;
import axios from "axios";
import {captureException} from "@sentry/node";
import * as Sentry from "@sentry/node";
import { extractJSON, waitTillHTMLRendered, sleep, getRndInteger, allowAssistiveWorker, isAssistLoadMaster, checkAssistLoad, delayedReload } from './utils.js';
import { setHealthInfo } from './health.js';
import { TimeoutError } from 'puppeteer';

const WORKER_TYPE = process.env.WORKER_TYPE;
const WORKER_ID = process.env.WORKER_ID;
const SUPPORTED_LISTENERS = process.env.SUPPORTED_LISTENERS
const PROXY = process.env.PROXY;


// @ts-ignore
console.logCopy = console.log.bind(console);

console.log = function()
{
    var timestamp = new Date().toUTCString();
    if (arguments.length)
    {
        var args = Array.prototype.slice.call(arguments, 0);
        if (typeof arguments[0] === "string")
        {
            args[0] = "%o: " + arguments[0];
            args.splice(1, 0, timestamp);
            // @ts-ignore
            this.logCopy.apply(this, args);
        }
        else
        {
            // @ts-ignore
            this.logCopy(timestamp, args);
        }
    }
};


const create_browser_task = async (page, c, data, er) => {
    const u = data.username;
    const p = data.password;
    const f = data.fg_id;

    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    await page.setViewport({
        width: 1920,
        height: 1080
    });
    
    console.log(c + ' loading home page');
    await Promise.all([
        page.goto(
            getHomePage(data.country, c),
            {waitUntil: 'networkidle0'}
        ).catch(_ => {}),

        page.waitForResponse(async (response) => {
            const url = getHomePage(data.country, c);
            if (await response.url() == url && [403,429].includes(await response.status())) {
                console.warn(c+": IP potentially blocked by cf WAF");
                await setHealthInfo(c, 403);
                // change_proxy()
            } else if (await response.url() == url && await response.ok()) {
                console.log(c+": IP passed");
                return true
            }
        })
    ]);

    await page.realCursor.moveTo(await getRandomPagePoint(page));
    await sleep(2331);
    await page.realCursor.moveTo(await getRandomPagePoint(page));

    console.log(c + ": home page loaded")
    await page.waitForSelector("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a").catch(_ => {});
    console.log(c+": loading login page")
    await page.realClick("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a", {hesitate: getRndInteger(234, 456), moveDelay: getRndInteger(86, 121)});

    // wait for cf hops
    await page.waitForResponse(async (response) => {
        // cf does a few hops, and we want to make sure we are in the requested page
        const url = cfHopRq(data.country);
        if (await response.url() === url && await response.status() === 200) {
            console.log(c+": cf hopping over. init login procedure")
            await sleep(2000)
            return true;
        }
    });

    console.log(c+": login page loaded")
    await page.realCursor.moveTo(getRandomPagePoint(page));
    await sleep(getRndInteger(1200, 1500));
    await page.waitForSelector('#username')
    await page.focus("#username");
    await page.keyboard.type(u, {delay: getRndInteger(40, 272)});
    await page.focus("#password");
    await page.keyboard.type(p, {delay: getRndInteger(56, 300)});
    await sleep(getRndInteger(560, 768))
    await page.realClick("#kc-login", {hesitate: getRndInteger(234, 456), moveDelay: getRndInteger(86, 121)});
    console.log(c+": Login attempted, waiting for cf hops to finish");

    // wait for cf hops
    await page.waitForResponse(async (response) => {
        // cf does a few hops, and we want to make sure we are in the requested page
        const url = cfHopRq2(data.country);
        if (await response.url() == url && await response.status() === 200) {
            console.log(c+": cf hopping over. init login procedure")
            await sleep(2000)
            return true;
        }
    });
    await sleep(getRndInteger(1500, 2000));
    console.log(c+": Login procedure finished")
    var responses = new Map()

    console.log(c+": loading appointment page")
    await page.setRequestInterception(true);
    await page.on('requestfinished', async (request) => {
        if (!request.url().endsWith('Stage=appointment')){ return }
        const response = await request.response();
        console.log(c+ ": "+ response.url() + " " + request.redirectChain().length + " " + await response.status(), await response.statusText())
        try {
            if ([403,429].includes(await response.status())) {
                console.warn(c+": possibly blocked by cloudflare WAF")
                setHealthInfo(c, 403);
                // delayedReload(page) todo
            } else if (!response.ok()) setHealthInfo(c, 500);
            if (request.redirectChain().length === 0 && response.ok()) {
                await setHealthInfo(c, 200);
                try {
                    const appType = new URL(response.url()).searchParams.get("appointmentType");
                    console.log(c+": Extracted " + appType)
                    responses.set(appType, await response.json())

                    if (responses.size == (["fr"].includes(data.country) ? 4 : 3)) {
                        console.log(c+": posting to internal api");
                        await axios.post(
                            `http://backend:8000/internal/slotUpdateV2/${c}`,
                            responses,
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            }
                        )
                        responses.clear()
                    }
                    
                } catch (e) {
                    await setHealthInfo(c, 500);
                    console.log(c+": encountered error: " + await response.text() +  " "+ e.toString());
                    captureException(e);
                }
            }
        }catch (err) { await setHealthInfo(c, 500); console.log(err + '\n\n' + request.toString()); captureException(err)}
    });

    await page.on('request', request => {
        request.continue();
    });
    await page.goto(apPage(data.country)+c+"/"+f);
    console.log(c+": loaded appointment page");

    var reloadCount = 0;
    var maxRC = 100;
    while (true) {
        await page.realCursor.moveTo(await getRandomPagePoint(page));
        console.log(c + " sleeping...")

        if (WORKER_TYPE == "ASSISTIVE" && isAssistLoadMaster()) allowAssistiveWorker(c, 90000);
        await sleep(1000 * 60 * 4);

        reloadCount++;
        
        console.log(c+': reload count: ' + reloadCount, "out of ", maxRC);
        if (reloadCount >= maxRC) {
            throw "reload";
        }
        const {windowId} = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

        await page.reload();
    }
}

async function b_wrapper(_, c, data, delay) {
    var retry = 0
    var err = false;
    var is_failed_restart = false;

    // todo: redis
    while (retry <= 3) {

        if (WORKER_TYPE == "ASSISTIVE" && !isAssistLoadMaster()) {
            console.log(c+": waiting for assist loading");
            try {
                await checkAssistLoad(c);
            } catch (e) {
                console.log(c+": Failed to assist load, Error=", e);
            }
            console.log(c+": assist load greenlit, proceeding");
        }

        const { browser, page } = await connect({
            headless: false,
            args: [
                "--start-maximized",
                "--disable-backgrounding-occluded-windows",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding"
            ],
            customConfig: {},
            turnstile: true,
            connectOption: {
                defaultViewport: null,
            },
            disableXvfb: false,
            ignoreAllFlags: false,
            // @ts-ignore
            proxy: PROXY == null ? {} : {
                host: PROXY,
                port: 8888,
            }
        })
        await sleep(err ? 60 * 1 * 1000 : delay);
        try {
            page.setDefaultTimeout(60 * 1000);
            err = false;
            await setHealthInfo(c, 102);
            await create_browser_task(page, c, data, is_failed_restart);
            is_failed_restart = true;
        } catch (e) {
            if (e == 'reload') {
                console.log(c+": Scheduled reload in progress...");
                is_failed_restart = false;
            } else {
                console.log(c+": Encountered error, initiating restart procedure...")
                if (e instanceof TimeoutError) await setHealthInfo(c, 408);
                else await setHealthInfo(c, 500);
                try {
                    // opt telemetry
                    const data = await page.screenshot({type: 'webp', quality: 50, 'path': `error_${c}.webp`});
                    Sentry.getCurrentScope().addAttachment({
                        'filename': `error_${c}.webp`,
                        'data': data
                    });
                } catch (e) { console.log("failed to capture, telemetry", e); }
                captureException(e)
                console.log(e);
                if (data.country == "fr") {
                    err = true;
                }
            }
            // retry++; failsafe
            browser.close()
        }
    }
}

async function bg_task_tls_adv() {

    console.log(WORKER_ID, "waiting for listener data")
    var resp = await axios.post(
        "http://backend:8000/internal/getListenerData",
        {
            "worker_type": WORKER_TYPE,
            "worker_id": WORKER_ID,
            "listeners": SUPPORTED_LISTENERS.split(','),
        },
        {
            timeout: 0,  // dont timeout
        }
    )
    var data = resp.data;
    console.log(WORKER_ID, "Recieved listener data");
    console.log("Worker Type: ", WORKER_TYPE);
    console.log("Listeners: ", SUPPORTED_LISTENERS);
    console.log("Proxy: ", PROXY);
    const delayIncr = 1000 * 60;  // 1 min delay between listeners, we dont wanna stress out
    let delay = 0;
    for (const center in data) {
        b_wrapper(null, center, data[center], delay);
        delay += delayIncr;
    }
}

bg_task_tls_adv()
