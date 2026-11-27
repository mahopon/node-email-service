import { type Channel, type ConsumeMessage } from "amqplib";
import type { Logger } from "pino";
import { executeEmailMessage, InvalidEmailMessageError } from "../worker/email-worker.js";

export interface MessageHandler {
    onMessage: (message: ConsumeMessage | null) => void;
    drain(forceAfterMs?: number): Promise<void>;
}

export function createMessageHandler(
    channel: Channel,
    log: Logger,
): MessageHandler {
    const inFlight = new Set<Promise<void>>();

    const onMessage = (message: ConsumeMessage | null): void => {
        if (!message) {
            log.warn("consumer cancelled by broker");
            return;
        }

        const task = processMessage(message, channel, log).catch((err: unknown) => {
            log.error(
                { err, deliveryTag: message.fields.deliveryTag },
                "message handler failed",
            );
        });

        inFlight.add(task);
        void task.finally(() => {
            inFlight.delete(task);
        });
    };

    const drain = async (forceAfterMs?: number): Promise<void> => {
        const pending = Promise.allSettled([...inFlight]);
        if (forceAfterMs === undefined) {
            await pending;
            return;
        }

        await Promise.race([
            pending,
            new Promise<void>((resolve) => {
                setTimeout(resolve, forceAfterMs).unref();
            }),
        ]);
    };

    return { onMessage, drain };
}

async function processMessage(
    message: ConsumeMessage,
    channel: Channel,
    log: Logger,
): Promise<void> {
    const started = performance.now();
    const messageLog = log.child({
        messageId: message.properties.messageId ?? message.fields.deliveryTag,
        redelivered: message.fields.redelivered,
    });

    let payload: unknown;
    try {
        payload = JSON.parse(message.content.toString("utf8"));
    } catch (err) {
        messageLog.warn({ err }, "discarding message with invalid JSON");
        channel.nack(message, false, false);
        return;
    }

    messageLog.info("processing email message");
    try {
        await executeEmailMessage(payload);
        channel.ack(message);
        messageLog.info(
            { durationMs: Math.round(performance.now() - started) },
            "email sent",
        );
    } catch (err) {
        if (err instanceof InvalidEmailMessageError) {
            messageLog.warn(
                { issues: err.issues },
                "discarding invalid email request",
            );
            channel.nack(message, false, false);
            return;
        }

        // Retry once on the broker, then drop the message instead of looping forever.
        const requeue = !message.fields.redelivered;
        messageLog.error(
            {
                err,
                durationMs: Math.round(performance.now() - started),
                requeue,
            },
            "failed to send email",
        );
        channel.nack(message, false, requeue);
    }
}
