
import * as puppeteer from 'puppeteer-real-browser';

import { debugGenerator, timeoutExecute } from '../../util';
import ConcurrencyImplementation, { WorkerInstance } from '../ConcurrencyImplementation';
const debug = debugGenerator('BrowserConcurrency');

const BROWSER_TIMEOUT = 5000;

export default class Browser extends ConcurrencyImplementation {
    public async init() {}
    public async close() {}

    public async workerInstance(perBrowserOptions: puppeteer.Options | undefined):
        Promise<WorkerInstance> {

        const options = perBrowserOptions || this.options;
        let browser = (await this.puppeteer.connect(options) as puppeteer.ConnectResult).browser;
        let page: puppeteer.ConnectResult['page']
        let context: any; // puppeteer typings are old...

        return {
            jobInstance: async () => {
                await timeoutExecute(BROWSER_TIMEOUT, (async () => {
                    context = await browser.createBrowserContext();
                    page = await context.newPage();
                })());

                return {
                    resources: {
                        page,
                    },

                    close: async () => {
                        await timeoutExecute(BROWSER_TIMEOUT, context.close());
                    },
                };
            },

            close: async () => {
                await browser.close();
            },

            repair: async () => {
                debug('Starting repair');
                try {
                    // will probably fail, but just in case the repair was not necessary
                    await timeoutExecute(BROWSER_TIMEOUT, browser.close());
                } catch (e) {}

                // just relaunch as there is only one page per browser
                browser = (await this.puppeteer.connect(options) as puppeteer.ConnectResult).browser;
            },
        };
    }

}
