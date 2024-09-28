import { typeInto } from "@forad/puppeteer-humanize";
import { getRndInteger, sleep } from "./utils.js";
import { getRandomPagePoint } from 'ghost-cursor';

export async function humainzedCursorMovement(page, country, minMoves, maxMoves) {
    if (["fr"].includes(country)) {
        var m_max = getRndInteger(1,2);
        for (var i = 0; i <= m_max; i++) {
            console.log(country+": realCursor movement: ", i, "out of", m_max);
            await page.realCursor.moveTo(await getRandomPagePoint(page));
            var sleep_t = getRndInteger(1500, 2500)
            console.log(country+": realCursor movement sleep for ", sleep_t);
            await sleep(sleep_t);
        }
    }
}


export async function humanaizedCredentialEntry(page, country, username, password) {
    if (["fr"].includes(country)) {
        const config = {
            mistakes: {
                chance: 20,
                delay: {
                    min: 70,
                    max: 800
                }
            },
            delays: {
                space: {
                    chance: 70,
                    min: 40,
                    max: 100
                }
            }
        };

        await sleep(getRndInteger(1200, 1500));
        await page.waitForSelector('#username')
        // await page.focus("#username");
        await page.realCursor.move("#username", {moveDelay: getRndInteger(50,200)}); 
        // await page.keyboard.type(u, {delay: getRndInteger(40, 272)});
        await typeInto(await page.$("#username"), username, config);
        // await page.focus("#password");
        await page.realCursor.move("#password", {moveDelay: getRndInteger(50,200)});
        // await page.keyboard.type(p, {delay: getRndInteger(56, 300)});
        await typeInto(await page.$("#password"), password, config);
        await sleep(getRndInteger(560, 768))

    
    } else {
        await sleep(getRndInteger(1200, 1500));
        await page.waitForSelector('#username')
        await page.focus("#username");
        await page.keyboard.type(username);
        await page.focus("#password");
        await page.keyboard.type(password);
    }
}
