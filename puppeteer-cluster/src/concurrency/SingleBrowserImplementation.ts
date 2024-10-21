
import * as puppeteer from 'puppeteer-real-browser';
import ConcurrencyImplementation, { ResourceData } from './ConcurrencyImplementation';

import { debugGenerator, timeoutExecute } from '../util';
import {ConnectResult} from "puppeteer-real-browser";
const debug = debugGenerator('SingleBrowserImpl');

const BROWSER_TIMEOUT = 5000;

export default abstract class SingleBrowserImplementation extends ConcurrencyImplementation {

    protected browser: puppeteer.ConnectResult['browser'] | null = null;

    private repairing: boolean = false;
    private repairRequested: boolean = false;
    private openInstances: number = 0;
    private waitingForRepairResolvers: (() => void)[] = [];

    public constructor(options: puppeteer.Options, puppeteer: any) {
        super(options, puppeteer);
    }

    private async repair() {
        if (this.openInstances !== 0 || this.repairing) {
            // already repairing or there are still pages open? wait for start/finish
            await new Promise<void>(resolve => this.waitingForRepairResolvers.push(resolve));
            return;
        }

        this.repairing = true;
        debug('Starting repair');

        try {
            // will probably fail, but just in case the repair was not necessary
            await timeoutExecute(BROWSER_TIMEOUT, (<puppeteer.ConnectResult['browser']>this.browser).close());
        } catch (e) {
            debug('Unable to close browser.');
        }

        try {
            this.browser = (await this.puppeteer.connect(this.options) as puppeteer.ConnectResult).browser;
        } catch (err) {
            throw new Error('Unable to restart chrome.');
        }
        this.repairRequested = false;
        this.repairing = false;
        this.waitingForRepairResolvers.forEach(resolve => resolve());
        this.waitingForRepairResolvers = [];
    }

    public async init() {
        this.browser = (await this.puppeteer.connect({
            headless: false,
            args: [
                "--incognito",
                "--start-maximized",
                "--disable-backgrounding-occluded-windows",
                "--disable-background-timer-throttling",
                "--disable-renderer-backgrounding",
            ],
            customConfig: {
                chromePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
            },
            turnstile: true,
            connectOption: {
                defaultViewport: null,
            },
            disableXvfb: false,
            ignoreAllFlags: false,
        }) as ConnectResult).browser;
    }

    public async close() {
        await (this.browser as puppeteer.ConnectResult['browser']).close();
    }

    protected abstract createResources(): Promise<ResourceData>;

    protected abstract freeResources(resources: ResourceData): Promise<void>;

    public async workerInstance() {
        let resources: ResourceData;

        return {
            jobInstance: async () => {
                if (this.repairRequested) {
                    await this.repair();
                }

                await timeoutExecute(BROWSER_TIMEOUT, (async () => {
                    resources = await this.createResources();
                })());
                this.openInstances += 1;

                return {
                    resources,

                    close: async () => {
                        this.openInstances -= 1; // decrement first in case of error
                        await timeoutExecute(BROWSER_TIMEOUT, this.freeResources(resources));

                        if (this.repairRequested) {
                            await this.repair();
                        }
                    },
                };
            },

            close: async () => {},

            repair: async () => {
                debug('Repair requested');
                this.repairRequested = true;
                await this.repair();
            },
        };
    }
}
