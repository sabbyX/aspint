
import * as puppeteer from 'puppeteer-real-browser';

import { ResourceData } from '../ConcurrencyImplementation';
import SingleBrowserImplementation from '../SingleBrowserImplementation';
import {ConnectResult} from "puppeteer-real-browser";

export default class Context extends SingleBrowserImplementation {

    protected async createResources(): Promise<ResourceData> {
        const context = await (this.browser as puppeteer.ConnectResult['browser'])
            .createBrowserContext();
        const page = (await context.newPage()) as ConnectResult['page'];
        return {
            context,
            page,
        };
    }

    protected async freeResources(resources: ResourceData): Promise<void> {
        await resources.context.close();
    }

}
