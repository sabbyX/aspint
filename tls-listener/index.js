import './intrument.js';
import {getHomePage, apPage, cfHopRq, tableC1, tableC2, tableC3} from './link.js'

import { connect } from 'puppeteer-real-browser'
import { newInjectedPage } from 'fingerprint-injector';
import axios from "axios";
import {captureException} from "@sentry/node";
import * as Sentry from "@sentry/node";
import { extractJSON } from './utils.js';

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const auth = {
    // 1/3/25
    'gbLON2de': {
        'username': 'aspint.de.lon.1@proton.me',
        'password': 'Test@123',
        'fg_id': 2687578,
        'country': 'de',
    },
    'gbMNC2de': {
        'username': 'aspint.de.mnc@proton.me',
        'password': 'Test@123',
        'fg_id': 2692445,
        'country': 'de'
    },
    'gbEDI2de': {
        'username': 'aspint.de.edi@proton.me',
        'password': 'Test@123',
        'fg_id': 2692471,
        'country': 'de',
    },
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
    },
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

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
      if (
        interceptedRequest.url().endsWith('.png') ||
        interceptedRequest.url().endsWith('.jpg')
      )
        interceptedRequest.abort();
      else interceptedRequest.continue();
    });

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
    
    console.log(c+ ": starting extraction procedure...");
    var reloadCount = 0;
    var maxRC = getRndInteger(4, 8);
    while (true) {
        
        console.log(c+": Extracting normal");
        await Promise.all([
            page.goto(tableC1(data.country, c, f)),
            page.waitForNavigation({waitUntil: 'networkidle0'}),
        ])

        requests.set("normal", await extractJSON(page));

        console.log(c+": Extracting prime time");
        await Promise.all([
            page.goto(tableC2(data.country, c, f)),
            page.waitForNavigation({waitUntil: 'networkidle0'}),
        ])

        requests.set("primetime", await extractJSON(page));

        console.log(c+": Extracting prime time weekend");
        await Promise.all([
            page.goto(tableC3(data.country, c, f)),
            page.waitForNavigation({waitUntil: 'networkidle0'}),
        ])

        requests.set("primetime weekend", await extractJSON(page));


        if (requests.size < 3) {
            console.log(c+": waiting for table requests");
            await page.waitForResponse(async (response) => {
                return response.url().includes("prime")
            })
            await waitTillHTMLRendered(page, c);
        }
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
        reloadCount++;
        console.log(c+': reload count: ' + reloadCount, "out of ", maxRC);
        if (reloadCount >= maxRC) {
            throw "reload";
        }
        const {windowId} = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});
    }
}

async function b_wrapper(_, c, data, delay) {
    var retry = 0
    // todo: redis
    while (retry <= 3) {
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
        })

        await sleep(delay)
        try {
            // @ts-ignore
            var page = await newInjectedPage(browser, {
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
                        'filename': `error_${c}.webp`,
                        'data': data
                    });
                } catch (e) { console.log("failed to capture, telemetry", e); }
                captureException(e)
                console.log(e);
            }
            // retry++; failsafe
            browser.close()
        }
    }
}

async function bg_task_tls_adv() {

    // const { browser } = await connect({
    //     headless: false,
    //     args: [
    //         "--start-maximized",
    //         "--disable-backgrounding-occluded-windows",
    //         "--disable-background-timer-throttling",
    //         "--disable-renderer-backgrounding"
    //     ],
    //     customConfig: {},
    //     turnstile: true,
    //     connectOption: {},
    //     disableXvfb: false,
    //     ignoreAllFlags: false,
    //     devTools: true,
    // })

    const delayIncr = 1000 * 60;  // 1 min delay between listeners, we dont wanna stress out
    let delay = 0;
    for (const center in auth) {
        b_wrapper(null, center, auth[center], delay);
        delay += delayIncr;
    }
}

bg_task_tls_adv()
