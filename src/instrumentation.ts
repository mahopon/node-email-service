import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { Closable } from "./shared/shutdown.js";

const sdk = new NodeSDK({
    instrumentations: [
        getNodeAutoInstrumentations({
            "@opentelemetry/instrumentation-fs": { enabled: false },
        }),
    ],
});

sdk.start();

export const telemetry: Closable = {
    close: () => sdk.shutdown(),
};
