import type { Server } from "node:http";
import type { Express } from "express";

export interface RunningServer {
    readonly server: Server
    close(opts?: { forceAfterMs?: number }): Promise<void>
}

export async function startServer(app: Express, port: number): Promise<RunningServer> {
    const server = app.listen(port);
    await new Promise<void>((resolve,reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
    })
    let closing: Promise<void> | undefined;
    const close = (opts?: { forceAfterMs: number }) => {
        closing ??= new Promise<void>((resolve, reject) => {
            const timer = setTimeout(
                () => server.closeAllConnections(),
                opts?.forceAfterMs ?? 10_000,
            ).unref();

            server.close((err) => {
                clearTimeout(timer);
                err ? reject(err) : resolve();
            });
        });
        return closing;
    }
    return {
        server, close
    };
};
