import "dotenv/config";
import { telemetry } from "../../instrumentation.js";
import { startConsumer } from "../../queue/consumer.js";
import { logger } from "../../shared/logger.js";
import { installShutdown } from "../../shared/shutdown.js";

async function main() {
    const consumer = await startConsumer();
    installShutdown(consumer, telemetry);
}

main().catch((err) => {
    logger.fatal({ err }, "queue worker failed");
    process.exit(1);
});
