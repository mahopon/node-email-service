import "dotenv/config";
import { startServer } from "../../server.js";
import createApp from "../../api/app.js";
import { installShutdown } from "../../shared/shutdown.js";

const PORT = Number(process.env.PORT);

async function main() {
    const app = createApp();
    console.log("Server started at port: " + PORT);
    const running = await startServer(app, PORT);
    installShutdown(running);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
