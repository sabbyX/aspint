import axios from "axios";
import { Page } from "puppeteer";
import http from 'http';

import { WORKER_ID, WORKER_TYPE } from "./constants.js";

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
    const minStableSizeIterations = 10;

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


export async function allowAssistiveWorker(c, t) {
    var resp = await axios.post(
        `http://localhost:8000/internal/allowAssistiveWorkers/${t}`,
        {
            "center": c,
            "worker_id": WORKER_ID,
            "worker_type": WORKER_TYPE,
        },
        {
            httpAgent: new http.Agent({keepAlive: true}),
            timeout: 0,
        }
    );
    if (resp.status == 200)
        console.log(WORKER_ID+": assist worker start command success");
    else
        console.warn(WORKER_ID+": Failed to start assist worker", resp.statusText);
}


export async function checkAssistLoad(c) {
    const max_tc = 2000
    var c_tc = 0;
    while (true) {
        var resp = await axios.post(
            "http://localhost:8000/internal/checkAssistLoad",
            {
                "center": c,
                "worker_id": WORKER_ID,
                "worker_type": WORKER_TYPE,
            },
            {
                httpAgent: new http.Agent({keepAlive: true})
            }
        )
        if (resp.data.status) {
            return resp.data.slpt
        };

        c_tc++;
        if (c_tc >= max_tc) break;

        await sleep(10000);
    }
}

export function isAssistLoadMaster() {
    return ((WORKER_ID).split('-')[1]) == "1"
}

export async function delayedReload(page) {
    await sleep(10 * 1000);
    await page.reload()
}

export async function isFReloadRequested(c) {
    try {
        var resp = await axios.get(
            `http://localhost:8000/internal/checkFreload/${WORKER_ID}/${c}`,
            {
                httpAgent: new http.Agent({keepAlive: true})
            }
        )
        if (resp.data.reload) {
            throw "reload";
        }
    } catch (e) {
        console.warn("failed to check freload");
    }
}

export async function rotateListener(c,data) {
    try {
        var resp = await axios.get(
            `http://localhost:8000/internal/rotateListener/${c}`,
            {
                httpAgent: new http.Agent({keepAlive: true}),
            }
        )
        if (resp.data.status == "ok") {
            console.log(c+": successfully rotated listener");
            return resp.data.data;
        }
    } catch (e) {
        console.log("failed to reload listener, error=", e.toString());
    } 

    console.log(c+": failed to rotate listener, note: listener might not have rotating capability")
    return data
}
