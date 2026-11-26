import "dotenv/config";
import { type RunningServer, startServer } from "./server.js";
import createApp from "./app.js";

const PORT = Number(process.env.PORT);
const EXIT_CODE = { SIGINT: 130, SIGTERM: 143 } as const;

function installShutdown(running: RunningServer) {
    for (const sig of ["SIGINT", "SIGTERM"] as const) {
        process.once(sig, () => {
            console.log(`${sig} received, shutting down`);
            void running.close( { forceAfterMs: 10_000 } )
            .then(() => { process.exitCode = EXIT_CODE[sig]; })
            .catch((err: unknown) => {
                console.error("shutdown failed", err);
                process.exit(1);
            });
        });
    }
}

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
