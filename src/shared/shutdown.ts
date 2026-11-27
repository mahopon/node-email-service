import { logger } from "./logger.js";

export const EXIT_CODE = { SIGINT: 130, SIGTERM: 143 } as const;

export interface Closable {
    close(opts?: { forceAfterMs?: number }): Promise<void>;
}

export function installShutdown(closable: Closable): void {
    for (const sig of ["SIGINT", "SIGTERM"] as const) {
        process.once(sig, () => {
            logger.info({ signal: sig }, "shutting down");
            void closable.close({ forceAfterMs: 10_000 })
                .then(() => { process.exitCode = EXIT_CODE[sig]; })
                .catch((err: unknown) => {
                    logger.error({ err }, "shutdown failed");
                    process.exit(1);
                });
        });
    }
}
