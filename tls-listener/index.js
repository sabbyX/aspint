// import './intrument.js';
import {getHomePage, apPage, cfHopRq, tableC1, tableC2, tableC3} from './link.js'

import { connect } from 'puppeteer-real-browser'
import { FingerprintInjector } from 'fingerprint-injector';
import { FingerprintGenerator } from 'fingerprint-generator'
import pkg from 'ghost-cursor';
const { getRandomPagePoint, installMouseHelper } = pkg;import axios from "axios";
import {captureException} from "@sentry/node";
import * as Sentry from "@sentry/node";
import { extractJSON, waitTillHTMLRendered, sleep, getRndInteger } from './utils.js';

var SAFE_ERROR = false;

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

const auth0 = {
    'gbLON2fr': {
        'username': 'cobeve6079@ofionk.com',
        'password': 'Test@123',
        'fg_id': 16887585,
        'country': 'fr'
    }
}

const auth1 = {
    'gbLON2fr': {
        'username': 'niniv69394@cetnob.com',
        'password': 'Test@123',
        'fg_id': 16902753,
        'country': 'fr'
    }
}

const auth = {
    'gbLON2fr': {
        'username': 'tidele4204@ofionk.com',
        'password': 'Test@123',
        'fg_id': 16898654,
        'country': 'fr'
    }
}

const auth4 = {
    'gbLON2fr': {
        'username': 'peleba6455@cetnob.com',
        'password': 'Test@123',
        'fg_id': 16892730,
        'country': 'fr'
    }
}

const auth2 = {
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


const create_browser_task = async (page, c, data) => {
    const u = data.username;
    const p = data.password;
    const f = data.fg_id;

    const session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    // await page.setViewport({
    //     width: 1920,
    //     height: 1080
    // });
    console.log(c + ' loading home page');
    await page.goto(
        getHomePage(data.country, c),
        {waitUntil: 'networkidle0'}
    ).catch(_ => {});

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

    if (data.country == "fr") {
        // wait for cf hops
        await page.waitForResponse(async (response) => {
            console.log("lis", response.url())
            // cf does a few hops, and we want to make sure we are in the requested page
            const url = "https://fr.tlscontact.com/";
            if (await response.url() == url && await response.status() === 200) {
                console.log(c+": cf hopping over. init login procedure")
                await sleep(2000)
                return true;
            }
        });
    } else {
        // todo
        await sleep(5000)
    }

    console.log(c+": Login procedure finished")
    var requests = new Map()

    if (data.country == "fr") {
        console.log(c+": loading appointment page")
        await page.setRequestInterception(true);
        await page.on('requestfinished', async (request) => {
            if (!request.url().endsWith('Stage=appointment')){ return }
            const response = await request.response();
            console.log(c+ ": "+ response.url() + " " + request.redirectChain().length + " " + await response.status(), await response.statusText())
            try {
                if ([403,429].includes(await response.status())) {
                    console.warn(c,"blocked by cloudflare WAF")
                }
                if (request.redirectChain().length === 0 && response.ok()) {
                    try {
                        const appType = new URL(response.url()).searchParams.get("appointmentType");
                        console.log(c+": Extracted " + appType)
                        //requests.set(appType, await response.json())
                        await axios.post(
                            `http://localhost:8000/internal/lazyUpdate/${f}/${appType}/${c}`,
                            await response.json(),
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                }
                            }
                        )
                    } catch (e) {
                        console.log(c+": encountered error: " + await response.text() +  " "+ e.toString());
                        captureException(e);
                    }
                }
            }catch (err) { console.log(err + '\n\n' + request.toString()); captureException(err)}
        });

        await page.on('request', request => {
            request.continue();
        });
        await page.goto(apPage(data.country)+c+"/"+f);
        console.log(c+"loaded appointment page");
    }
    console.log(c+ ": starting extraction procedure...");
    var reloadCount = 0;
    var maxRC = data.country == "fr" ? 15000 : getRndInteger(4,7);
    while (true) {
       
        if (data.country != "fr") {
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
                // const status = await axios.post(
                //     `http://backend:8000/internal/slotUpdate/${data.country}/${c}`, {
                //         normal: requests.get('normal'),
                //         prime_time: requests.get('primetime'),
                //         prime_time_weekend: requests.get('primetime weekend'),
                //     },
                //     {
                //         headers: {
                //             'Content-Type': 'application/json',
                //         }
                //     }
                //     );
                console.log("pri", requests.get("primetime").toString());
                console.log("pw", requests.get("primetime weekend").toString());
                if (200 !== 200) {
                    console.warn(c + ": internal api returned unexpected status.")
                } else {
                    console.log(c+": successfully posted updated slot data to internal api")
                }
            }
        }

        console.log(c + " sleeping...")
        await sleep(1000 * 60 * 5);
        requests.clear();
        reloadCount++;
        if (data.country != "fr") console.log(c+': reload count: ' + reloadCount, "out of ", maxRC);
        if (reloadCount >= maxRC) {
            throw "reload";
        }
        const {windowId} = await session.send('Browser.getWindowForTarget');
        await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});
        if (data.country == "fr") {
            await page.reload()
        }
    }
}

async function b_wrapper(_, c, data, delay) {
    var retry = 0
    var err = false;
    // todo: redis
    while (retry <= 3) {
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
            // proxy: data.country != "fr" ? null : {
            //     host: "91.26.124.18",
            //     port: 3128,
            // }
        })
        await sleep(err ? 60 * 10 * 1000 : delay);
        try {
            page.setDefaultTimeout(60 * 1000);
            err = false;
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
                err = true;
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
