import {getHomePage, cfHopRq, cfHopRq2} from "./link.js";
// import { PageWithCursor } from "puppeteer-real-browser";
import { humanaizedCredentialEntry, humainzedCursorMovement } from "./humanize.js"
import {getRndInteger, sleep} from "./utils.js";

/**
 * @param {PageWithCursor} page
 * @param {string} username
 * @param {string} password
 * @param {int} formId
 * @param {string} country
 * @param {string} center
 * @param {string} slot
 * @param {string} slotType
 * @param {boolean} isFlexible
 *
 */
export async function autobookCore(
    page,
    username,
    password,
    formId,
    country,
    center,
    slot,
    slotType,
    isFlexible,
) {
    const homeLink = getHomePage(country, center);
    let session = await page.target().createCDPSession();
    const {windowId} = await session.send('Browser.getWindowForTarget');
    await session.send('Browser.setWindowBounds', {windowId, bounds: {windowState: 'normal'}});

    page.setDefaultTimeout(120000)
    console.log(center, username, "loading homepage");
    await Promise.all([
        page.goto(
            homeLink,
            {waitUntil: 'networkidle0'}
        ).catch(_ => {}),

        page.waitForResponse(async (response) => {
            if (response.url().includes(homeLink) && [403,429].includes(response.status())) {
                console.warn(center, username, "IP potentially blocked by CF WAF");
                // await setHealthInfo(c, 403);
                // change_proxy()
            } else if (response.url().includes(homeLink) && response.ok()) {
                console.log(center, username, "IP passed");
                return true
            }
        })
    ]);

    await sleep(999999);

    await humainzedCursorMovement(page, country, 2, 3);
    console.log(center, username, "home page loaded")
    await page.waitForSelector("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a").catch(_ => {});
    console.log(center, username, "loading login page")
    await page.realClick("#tls-navbar > div > div.tls-navbar--links.-closed.height52 > div.tls-log > div > a", {hesitate: getRndInteger(234, 456), moveDelay: getRndInteger(86, 121)});

    // wait for cf hops
    await page.waitForResponse(async (response) => {
        // cf does a few hops, and we want to make sure we are in the requested page
        const url = cfHopRq(country);
        if (response.url().includes(url) && response.status() === 200) {
            console.log(center, username, "cf hopping over. init login procedure")
            await sleep(2000)
            return true;
        }
    });

    // needed?
    await humainzedCursorMovement(page, country, 3, 4);

    await sleep(getRndInteger(1200, 1500));
    console.log(country, username, "credential entry begin");
    await humanaizedCredentialEntry(page, country, username, password);
    await sleep(getRndInteger(900,1500));
    console.log(country, username, "credential entry finished");

    if (["fr"].includes(country)) await page.realCursor.click("#kc-login", {moveDelay: getRndInteger(86, 121)});
    else await page.$eval("#kc-login", e => e.click());
    console.log(country, username, "Login attempted, waiting for cf hops to finish");
    await page.waitForResponse(async (response) => {
        // cf does a few hops, and we want to make sure we are in the requested page
        const url = cfHopRq2(country);
        if (response.url() === url && response.status() === 200) {
            console.log(center, username, "cf hopping over. init login procedure")
            await sleep(2000)
            return true;
        }
    });
    await sleep(getRndInteger(1500, 2000));
    console.log(country, username, "Login procedure finished");

    // const cookies = await page.cookies();
    // let essentialCookies = []
    // for (let i = 0; i < cookies.length; i++) {
    //     const currCookie = cookies[i];
    //     if (!currCookie.name.includes("cf") && !currCookie.name.includes("datadome") && !currCookie.name.includes("pk_ses") && !currCookie.name.includes("stg"))  {
    //         console.log(currCookie.name);
    //         essentialCookies.push(currCookie);
    //     } else console.log("avoiding ", currCookie.name)
    // }

    page.setDefaultTimeout(120000)
    await page.setCookie(...essentialCookies);
    await page.goto(getHomePage(country, center));
    await sleep(9999999);

    // document.getElementsByClassName("tls-appointment-time-picker")[0].__vue__.selectSlot(data, {hour, type})
}
