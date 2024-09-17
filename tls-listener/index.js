// import './intrument.js';
import {getHomePage, apPage, cfHopRq, tableC1} from './link.js'

import { connect } from 'puppeteer-real-browser'
import { newInjectedPage } from 'fingerprint-injector';
import axios from "axios";
import {captureException} from "@sentry/node";
import * as Sentry from "@sentry/node";

// @ts-ignore
console.logCopy = console.log.bind(console);

console.log = function()
{
    var timestamp = new Date().toJSON();
    if (arguments.length)
    {
        var args = Array.prototype.slice.call(arguments, 0);
        if (typeof arguments[0] === "string")
        {
            args[0] = "%o: " + arguments[0];
            args.splice(1, 0, timestamp);
            this.logCopy.apply(this, args);
        }
        else
        {
            this.logCopy(timestamp, args);
        }
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const auth = {
    'gbLON2be': {
        'username': 'sopadam438@ploncy.com',
        'password': 'Test@123',
        'fg_id': 1194619,
        'country': 'be'
    },
    'gbMNC2be': {
        'username': 'aspint.be.mnc@proton.me',
        'password': 'Test@123',
        'fg_id': 1195388,
        'country': 'be',
    },

    // 1/3/25
    'gbEDI2be': {
        'username': 'aspint.be.edi@proton.me',
        'password': 'Test@123',
        'fg_id': 1200394,
        'country': 'be'
    },

    // 1/3/25
    'gbLON2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1201348,
        'country': 'ch',
    },
    // 1/3/25
    'gbEDI2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1202124,
        'country': 'ch',
    },
    'gbMNC2ch': {
        'username': 'nogaf50833@hapied.com',
        'password': 'Test@123',
        'fg_id': 1202133,
        'country': 'ch',
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

const create_browser_task = async (page, c, data) => {
    const u = data.username;
    const p = data.password;
    const f = data.fg_id;

    await page.setViewport({
        width: 1920,
        height: 1080
    });
    console.log(c + ' loading home page');
    await page.goto(
        getHomePage(data.country, c),
        {waitUntil: 'domcontentloaded'}
    ).catch(_ => {});

    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    console.log(c + ": Home Page")
    await page.waitForSelector("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a").catch(_ => {});
    await page.locator("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a").click()

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
    console.log(c+": Login Page")
    await page.waitForSelector('#username')
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

    await page.goto(tableC1(data.country, c, f));
    console.log("naah", await page.content());
    
    console.log(c+ ": loading appoint page")
    await page.goto(apPage(data.country) + c + "/" + f)
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
                `http://backend:8000/internal/slotUpdate/${data.country}/${c}`, {
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
        console.log(c+': reload count: ' + reloadCount, "out of ", maxRC);
        if (reloadCount >= maxRC) {
            throw "reload";
        }
        const {windowId} = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});
    }
}

async function b_wrapper(browser, c, data, delay) {
    var retry = 0
    // todo: redis
    while (retry <= 3) {
        await sleep(delay)
        try {
            var bc = await browser.createBrowserContext()
            //var page = await bc.newPage()
            var page = await newInjectedPage(bc, {
                fingerprintOptions: {
                    devices: ['desktop'],
                    operatingSystems: ['windows']
                }
            })
            page.setDefaultTimeout(60 * 1000);
            await create_browser_task(page, c, data);
        } catch (e) {
            if (e == 'reload') {
                console.log(c+": Scheduled reload in progress...");
            } else {
                console.log(c+": Encountered error, initiating restart procedure...")
                try {
                    // opt telemetry
                    const data = await page.screenshot({type: 'webp', quality: 50, 'path': `error_${c}.webp`});
                    Sentry.getCurrentScope().addAttachment({
                        'filename': `error_${c}`,
                        'data': data
                    });
                } catch (e) { console.log("failed to capture, telemetry", e); }
                captureException(e)
                console.log(e);
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

    const delayIncr = 1000 * 60;  // 1 min delay between listeners, we dont wanna stress out
    let delay = 0;
    for (const center in auth) {
        b_wrapper(browser, center, auth[center], delay);
        delay += delayIncr;
    }
}

bg_task_tls_adv()
