import type { Logger } from "pino";
import { logger } from "../shared/logger.js";
import { mqOpts } from "../shared/settings.js";
import type { Closable } from "../shared/shutdown.js";
import { type Broker, closeBroker, connectBroker, observeBroker } from "./broker.js";
import { type MessageHandler, createMessageHandler } from "./delivery.js";

interface CloseContext {
    broker: Broker;
    consumerTag: string;
    messages: MessageHandler;
    log: Logger;
}

export async function startConsumer(): Promise<Closable> {
    const log = logger.child({ queue: mqOpts.queue });
    const broker = await connectBroker();

    observeBroker(broker, log);

    const messages = createMessageHandler(broker.channel, log);
    const { consumerTag } = await broker.channel.consume(
        mqOpts.queue,
        messages.onMessage,
        { noAck: false },
    );

    log.info(
        { consumerTag, prefetch: mqOpts.prefetch },
        "email consumer started",
    );

    return {
        close: createClose({ broker, consumerTag, messages, log }),
    };
}

function createClose(context: CloseContext): Closable["close"] {
    let closePromise: Promise<void> | undefined;

    return (opts) => {
        closePromise ??= closeConsumer(context, opts);
        return closePromise;
    };
}

async function closeConsumer(
    { broker, consumerTag, messages, log }: CloseContext,
    opts?: { forceAfterMs?: number },
): Promise<void> {
    broker.state.closing = true;
    log.info("stopping email consumer");

    try {
        await broker.channel.cancel(consumerTag);
    } catch (err) {
        log.warn({ err }, "failed to cancel consumer");
    }

    await messages.drain(opts?.forceAfterMs);
    await closeBroker(broker, log);

    log.info("email consumer stopped");
}
