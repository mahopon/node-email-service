import "dotenv/config";

// Queue worker entrypoint.
//
// TODO: start the queue consumer here and pass its close handle to
// installShutdown(), e.g.:
//
//   import { installShutdown } from "../../shared/shutdown.js";
//   const worker = await startWorker();
//   installShutdown(worker);
async function main() {
    console.log("Queue worker entrypoint is ready; no consumer configured yet");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
