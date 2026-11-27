import "dotenv/config";
import { telemetry } from "../../instrumentation.js";
import { startServer } from "../../api/server.js";
import createApp from "../../api/app.js";
import { logger } from "../../shared/logger.js";
import { installShutdown } from "../../shared/shutdown.js";

const PORT = Number(process.env.PORT);

async function main() {
    const app = createApp();
    const running = await startServer(app, PORT);
    logger.info({ port: PORT }, "api listening");
    installShutdown(running, telemetry);
}

main().catch((err) => {
    logger.fatal({ err }, "api failed to start");
    process.exit(1);
});
