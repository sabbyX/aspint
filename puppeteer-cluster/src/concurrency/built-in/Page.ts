
import * as puppeteer from 'puppeteer-real-browser';

import { ResourceData } from '../ConcurrencyImplementation';
import SingleBrowserImplementation from '../SingleBrowserImplementation';

export default class Page extends SingleBrowserImplementation {

    protected async createResources(): Promise<ResourceData> {
        return {
            page: (await (this.browser as puppeteer.ConnectResult['browser']).newPage()) as puppeteer.ConnectResult['page'],
        };
    }

    protected async freeResources(resources: ResourceData): Promise<void> {
        await resources.page.close();
    }
}
