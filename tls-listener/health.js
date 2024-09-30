import axios from 'axios';
import http from 'http';

import { WORKER_ID, WORKER_TYPE, LISTENERS, DEF_PROXY } from './constants.js'

const HEALTH_API_ENDPOINT = "http://localhost:8000/health/setWorkerHealth";
// spec:
// 2 WORKER_TYPE (s)
// - ASSISTIVE
// - INDEPENDENT

// 200 OK
// 102 RESTARTING
// 403 FORBIDDEN -> BLOCKED BY WAF
// 408 TIMEOUT
// 500 OTHER ERRORS
export async function setHealthInfo(center, code) {
    var PROXY = DEF_PROXY;

    try {
        await axios.post(
            HEALTH_API_ENDPOINT,
            {
                "center": center,
                "health_code": code,
                "worker_type": WORKER_TYPE,
                "worker_id": WORKER_ID,
                "listeners": LISTENERS.split(','),
                "proxy": PROXY
            }
        ),
        {
            httpAgent: new http.Agent({keepAlive: true})
        }
    }
    catch (e) {
        console.log("failed to post health check:: error:", e);
    }
}
