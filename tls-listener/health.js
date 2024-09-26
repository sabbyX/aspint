import axios from "axios";

const HEALTH_API_ENDPOINT = "http://backend:8000/health/setWorkerHealth";
const WORKER_TYPE = process.env.WORKER_TYPE;
const LISTENERS = process.env.LISTENERS;
// spec:
// 2 WORKER_TYPE (s)
// - ASSISTIVE
// - INDEPENDENT
const WORKER_ID = process.env.WORKER_ID;

// 200 OK
// 102 RESTARTING
// 403 FORBIDDEN -> BLOCKED BY WAF
// 408 TIMEOUT
// 500 OTHER ERRORS
export async function setHealthInfo(center, code) {
    var PROXY = process.env.PROXY
    try {
        await axios.post(
            HEALTH_API_ENDPOINT,
            {
                "center": center,
                "health_code": code,
                "worker_type": WORKER_TYPE,
                "worker_id": WORKER_ID,
                "listeners": LISTENERS,
                "proxy": PROXY
            }
        )
    }
    catch (e) {
        console.log("failed to post health check:: error:", e);
    }
}
