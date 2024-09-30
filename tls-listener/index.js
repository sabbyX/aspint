import './intrument.js';
import {getHomePage, apPage, cfHopRq, cfHopRq2} from './link.js'
import { humainzedCursorMovement, humanaizedCredentialEntry } from './humanize.js';


import { connect } from 'puppeteer-real-browser'
import axios from "axios";
import {captureException} from "@sentry/node";
import * as Sentry from "@sentry/node";
import { sleep, getRndInteger, allowAssistiveWorker, isAssistLoadMaster, checkAssistLoad, delayedReload, isFReloadRequested, rotateListener } from './utils.js';
import { setHealthInfo } from './health.js';
import { TimeoutError } from 'puppeteer';
import http from 'http';
import {
    WORKER_ID,
    WORKER_TYPE,
    DEF_PROXY,
    LISTENERS,
    DEF_PROXY_PORT,
    DEF_PROXY_UN,
    DEF_PROXY_PW,
    BACKEND_HOST, BROWSER_PATH
} from './constants.js'

const SUPPORTED_LISTENERS = LISTENERS
var PROXY = DEF_PROXY;
var PROXY_PORT = DEF_PROXY_PORT
var PROXY_UN = DEF_PROXY_UN
var PROXY_PW = DEF_PROXY_PW

import dns from 'dns';
// Set default result order for DNS resolution
dns.setDefaultResultOrder('ipv4first');

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
    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (
          interceptedRequest.url().endsWith('.png') ||
          interceptedRequest.url().endsWith('.jpg')
        )
          interceptedRequest.abort('failed', 0);
        else
          interceptedRequest.continue(
            interceptedRequest.continueRequestOverrides(),
            0
          );
      });

    await page.setViewport({
        width: 1920,
        height: 1080
    });

    console.log(c+": "+JSON.stringify(data));

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

    await humainzedCursorMovement(page, data.country, 2, 3);
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

    // needed?
    await humainzedCursorMovement(page, data.country, 3, 4);

    await sleep(getRndInteger(1200, 1500));
    console.log(c+": credential entry begin");
    await humanaizedCredentialEntry(page, data.country, data.username, data.password);
    await sleep(getRndInteger(900,1500));
    console.log(c+": credential entry finished");

    if (["fr", "be", "de", "ch"].includes(data.country)) await page.realCursor.move("#kc-login", {moveDelay: getRndInteger(86, 121)});
    await page.$eval("#kc-login", e => e.click());

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
    var response_count = 0;
    var prev_status = 0;

    console.log(c+": loading appointment page")
    await page.on('requestfinished', async (request) => {
        if (!request.url().endsWith('Stage=appointment')){ return }
        const response = await request.response();
        prev_status = await response.status();
        console.log(c+ ": "+ response.url() + " " + request.redirectChain().length + " " + await response.status(), await response.statusText())
        try {
            response_count++;
            if ([403,429].includes(await response.status())) {
                console.warn(c+": possibly blocked by cloudflare WAF")
                if (response_count == (["fr"].includes(data.country) ? 4 : 3)) 
                {
                    if ([403].includes(await response.status()))
                    {
                        setHealthInfo(c, 403);
                        if (["be"].includes(data.country)) throw "reload";
                        console.log(c+": CF WAF 403: attempting reload page");
                        await delayedReload(page);
                    }
                    if ([429].includes(await response.status())) {
                        setHealthInfo(c, 403);
                        console.log(c+": CF 429 BLOCK, proxy: ", PROXY)
                    }
                }
            } else if (!response.ok() && response_count == (["fr"].includes(data.country) ? 4 : 3)) setHealthInfo(c, 500);
            if (request.redirectChain().length === 0 && response.ok()) {
                await setHealthInfo(c, 200);
                try {
                    const appType = new URL(response.url()).searchParams.get("appointmentType");
                    console.log(c+": Extracted " + appType)
                    responses.set(appType, await response.json())

                    if (responses.size == (["fr"].includes(data.country) ? 4 : 3)) {
                        console.log(c+": posting to internal api");
                        await axios.post(
                            `${BACKEND_HOST}/internal/slotUpdateV2/${c}`,
                            JSON.stringify(Object.fromEntries(responses)),
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
            if (response_count == (["fr"].includes(data.country) ? 4 : 3)) {
                response_count = 0

                await humainzedCursorMovement(page, data.country, 3, 4);

                var cookies = [
                    {'name': '__cf_bm'},
                    {'name': '__cf_clearance'},
                ]
                // if ([429].includes(prev_status)) await page.deleteCookie(...cookies)
            };
        }catch (err) { 
            await setHealthInfo(c, 500);
            console.log(err + '\n\n' + request.toString()); 
            captureException(err)
        }
    });

    await page.on('request', request => {
        request.continue();
    });
    await page.goto(apPage(data.country)+c+"/"+data.fg_id);
    console.log(c+": loaded appointment page");

    var reloadCount = 0;
    // rotate in 1 hour, todo: 30 min rotation?
    var maxRC = WORKER_TYPE == "ASSISTIVE"? 100 : 12;
    while (true) {
        console.log(c + " sleeping...")

        await isFReloadRequested(c);

        if (WORKER_TYPE == "ASSISTIVE" && isAssistLoadMaster()) allowAssistiveWorker(c, reloadCount == 0 ? 90000 : 150000);

        if (WORKER_TYPE == "ASSISTIVE" && !isAssistLoadMaster()) {    
            console.log(c+": waiting for assist load");
            var slpty = Number(await checkAssistLoad(c));
            console.log(c+": greenlit for assist loading, sleep time", slpty)
            await sleep(slpty)
        } else await sleep(1000 * 60 * 4);

        reloadCount++;

        console.log(c+': reload count: ' + reloadCount, "out of ", maxRC);
        if (reloadCount >= maxRC) {
            // todo: make ASSISTIVE able to rotate?
            throw "reloadListener";
        }

        const {windowId} = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

        if (await page.url() != apPage(data.country)+c+"/"+data.fg_id) console.log(c+": found redirected/unexpected ap page: ", await page.url(), "expected :", apPage(data.country)+c+"/"+data.fg_id);
        await page.goto(apPage(data.country)+c+"/"+data.fg_id);
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
                var slpt = await checkAssistLoad(c);
                console.log(c+": assist load, sleep request = ", slpt)
                await sleep(slpt)
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
                "--disable-renderer-backgrounding",
            ],
            customConfig: {
                chromePath: BROWSER_PATH,
            },
            turnstile: true,
            connectOption: {
                defaultViewport: null,
            },
            disableXvfb: false,
            ignoreAllFlags: false,
            // @ts-ignore
            proxy: PROXY == null ? {} : {
                host: PROXY,
                port: PROXY_PORT,
                username: PROXY_UN,
                password: PROXY_PW,
            },
        })

        if (err) console.log(c+": recovery restart - sleeping for 1 min");
        await sleep(err ? 60000 : delay);
        try {
            page.setDefaultTimeout(120 * 1000);
            await page.emulateTimezone('Europe/London');
            
            err = false;
            await setHealthInfo(c, 102);
            await create_browser_task(page, c, data, is_failed_restart);
            is_failed_restart = true;
        } catch (e) {
            if (e == 'reload') {
                console.log(c+": Scheduled reload in progress...");
                is_failed_restart = false;
            } else if (e == 'reloadListener') {
                if (WORKER_TYPE == "INDE") data = await rotateListener(c, data);
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
                    })
                    .setExtra("page", await page.content());
                } catch (e) { console.log("failed to capture, telemetry", e); }
                captureException(e)
                console.log(e);
            }
            err = true;
            // retry++; failsafe
            browser.close()
        }
    }
}

async function bg_task_tls_adv() {

    console.log(WORKER_ID, "waiting for listener data")
    var resp = await axios.post(
        `${BACKEND_HOST}/internal/getListenerData`,
        {
            "worker_type": WORKER_TYPE,
            "worker_id": WORKER_ID,
            "proxy": PROXY,
            "listeners": SUPPORTED_LISTENERS.split(','),
        },
        {
            timeout: 0,  // dont timeout
            httpAgent: new http.Agent({keepAlive: true})
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
