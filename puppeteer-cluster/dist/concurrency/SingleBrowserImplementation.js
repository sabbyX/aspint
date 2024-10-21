"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ConcurrencyImplementation_1 = require("./ConcurrencyImplementation");
const util_1 = require("../util");
const debug = (0, util_1.debugGenerator)('SingleBrowserImpl');
const BROWSER_TIMEOUT = 5000;
class SingleBrowserImplementation extends ConcurrencyImplementation_1.default {
    constructor(options, puppeteer) {
        super(options, puppeteer);
        this.browser = null;
        this.repairing = false;
        this.repairRequested = false;
        this.openInstances = 0;
        this.waitingForRepairResolvers = [];
    }
    repair() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.openInstances !== 0 || this.repairing) {
                // already repairing or there are still pages open? wait for start/finish
                yield new Promise(resolve => this.waitingForRepairResolvers.push(resolve));
                return;
            }
            this.repairing = true;
            debug('Starting repair');
            try {
                // will probably fail, but just in case the repair was not necessary
                yield (0, util_1.timeoutExecute)(BROWSER_TIMEOUT, this.browser.close());
            }
            catch (e) {
                debug('Unable to close browser.');
            }
            try {
                this.browser = (yield this.puppeteer.connect(this.options)).browser;
            }
            catch (err) {
                throw new Error('Unable to restart chrome.');
            }
            this.repairRequested = false;
            this.repairing = false;
            this.waitingForRepairResolvers.forEach(resolve => resolve());
            this.waitingForRepairResolvers = [];
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = (yield this.puppeteer.connect({
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
            })).browser;
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.browser.close();
        });
    }
    workerInstance() {
        return __awaiter(this, void 0, void 0, function* () {
            let resources;
            return {
                jobInstance: () => __awaiter(this, void 0, void 0, function* () {
                    if (this.repairRequested) {
                        yield this.repair();
                    }
                    yield (0, util_1.timeoutExecute)(BROWSER_TIMEOUT, (() => __awaiter(this, void 0, void 0, function* () {
                        resources = yield this.createResources();
                    }))());
                    this.openInstances += 1;
                    return {
                        resources,
                        close: () => __awaiter(this, void 0, void 0, function* () {
                            this.openInstances -= 1; // decrement first in case of error
                            yield (0, util_1.timeoutExecute)(BROWSER_TIMEOUT, this.freeResources(resources));
                            if (this.repairRequested) {
                                yield this.repair();
                            }
                        }),
                    };
                }),
                close: () => __awaiter(this, void 0, void 0, function* () { }),
                repair: () => __awaiter(this, void 0, void 0, function* () {
                    debug('Repair requested');
                    this.repairRequested = true;
                    yield this.repair();
                }),
            };
        });
    }
}
exports.default = SingleBrowserImplementation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2luZ2xlQnJvd3NlckltcGxlbWVudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmN1cnJlbmN5L1NpbmdsZUJyb3dzZXJJbXBsZW1lbnRhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUVBLDJFQUFzRjtBQUV0RixrQ0FBeUQ7QUFFekQsTUFBTSxLQUFLLEdBQUcsSUFBQSxxQkFBYyxFQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEQsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBRTdCLE1BQThCLDJCQUE0QixTQUFRLG1DQUF5QjtJQVN2RixZQUFtQixPQUEwQixFQUFFLFNBQWM7UUFDekQsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztRQVJwQixZQUFPLEdBQThDLElBQUksQ0FBQztRQUU1RCxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBQ2pDLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBQzFCLDhCQUF5QixHQUFtQixFQUFFLENBQUM7SUFJdkQsQ0FBQztJQUVhLE1BQU07O1lBQ2hCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM3Qyx5RUFBeUU7Z0JBQ3pFLE1BQU0sSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLE9BQU87WUFDWCxDQUFDO1lBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFekIsSUFBSSxDQUFDO2dCQUNELG9FQUFvRTtnQkFDcEUsTUFBTSxJQUFBLHFCQUFjLEVBQUMsZUFBZSxFQUF1QyxJQUFJLENBQUMsT0FBUSxDQUFDLEtBQUss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