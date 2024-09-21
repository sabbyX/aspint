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

export const waitTillHTMLRendered = async (page, c, timeout = 30000) => {
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

export function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
