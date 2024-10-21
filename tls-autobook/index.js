import express from 'express';
import {Cluster} from "puppeteer-cluster";
import {autobookCore} from "./core.js";

const app = express();
app.use(express.json());

(async () => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 2,
        retryLimit: 3,
        retryDelay: 10000,
    });

    await cluster.task(async ({ page, data }) => {
        await autobookCore(page, data.username, data.password, data.formId, data.country, data.center, data.slot, data.slotType, true);
    });

    // setup server
    app.post('/', async function (req, res) {
        /*
        * {
        *   username: string
        *   password: string
        *   formId: string
        *   country: string,
        *   center: string,
        *   slot: string
        *   slotType: string
        * }
        * */
        let data = {
            username: req.body.username,
            password: req.body.password,
            formId: req.body.formId,
            country: req.body.country,
            center: req.body.center,
            slot: req.body.slot,
            slotType: req.body.slotType,
        };

        try {
            console.log("Received AB request, proceeding...")
            await cluster.queue(data);
            // respond with image
            res.status(200).send({message: 'ok'});
        } catch (err) {
            // catch error
            res.status(500).send({message: err.toString()});
        }
    });

    app.listen(9000, function () {
        console.log('Autobook server listening on port 9000');
    });
})();
