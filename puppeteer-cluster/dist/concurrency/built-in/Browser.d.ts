import * as puppeteer from 'puppeteer-real-browser';
import ConcurrencyImplementation, { WorkerInstance } from '../ConcurrencyImplementation';
export default class Browser extends ConcurrencyImplementation {
    init(): Promise<void>;
    close(): Promise<void>;
    workerInstance(perBrowserOptions: puppeteer.Options | undefined): Promise<WorkerInstance>;
}
