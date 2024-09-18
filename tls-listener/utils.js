import { Page } from "puppeteer";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {Page} page
 */
export async function extractJSON(page) {
    const json = await page.evaluate(async () => {

        var data = document.querySelector('pre').innerText;
        const mc = 5;
        var retry = 0;
        while (data == null && retry < mc) {
            await sleep(1 * 1000);
            retry++;
            data = document.querySelector('pre').innerText;
        }

        return JSON.parse(data);
    })
    return json
}
