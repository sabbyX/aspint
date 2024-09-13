import * as Sentry from "@sentry/node";
import {captureConsoleIntegration, localVariablesIntegration} from "@sentry/node";

Sentry.init({
    dsn: "https://7ea90707928a2e2c6c62151f1ebd336b@o389497.ingest.us.sentry.io/4507934963990528",
    integrations: [
        captureConsoleIntegration({levels: ['warn', 'error', ]}),
        localVariablesIntegration(),
    ],
    tracesSampleRate: 0.5,
    includeLocalVariables: true
});

