import { Page } from "puppeteer";

/**
 * @param {Page} page
 */
export async function extractJSON(page) {
    const json = await page.evaluate(async () => {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }        

        var data = document.querySelector('pre');
        const mc = 5;
        var retry = 0;
        while (data == null && retry < mc) {
            await sleep(1 * 6000);
            retry++;
            data = document.querySelector('pre');
        }

        return JSON.parse(data.innerText);
    })
    return json
}
