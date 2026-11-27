import { logger } from "./logger.js";

export const EXIT_CODE = { SIGINT: 130, SIGTERM: 143 } as const;

export interface Closable {
    close(opts?: { forceAfterMs?: number }): Promise<void>;
}

export function installShutdown(...closables: Closable[]): void {
    for (const sig of ["SIGINT", "SIGTERM"] as const) {
        process.once(sig, () => {
            logger.info({ signal: sig }, "shutting down");
            void Promise.allSettled(
                closables.map((closable) =>
                    closable.close({ forceAfterMs: 10_000 }),
                ),
            ).then((results) => {
                const failure = results.find((result) => result.status === "rejected");
                if (failure?.status === "rejected") {
                    logger.error({ err: failure.reason }, "shutdown failed");
                    process.exit(1);
                }
                process.exitCode = EXIT_CODE[sig];
            });
        });
    }
}
