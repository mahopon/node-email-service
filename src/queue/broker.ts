import amqp, { type Channel, type ChannelModel } from "amqplib";
import type { Logger } from "pino";
import { mqOpts } from "../shared/settings.js";

export interface BrokerState {
    closing: boolean;
}

export interface Broker {
    channel: Channel;
    connection: ChannelModel;
    state: BrokerState;
}

export async function connectBroker(): Promise<Broker> {
    const connection = await amqp.connect(mqOpts.url);
    const channel = await connection.createChannel();

    await channel.prefetch(mqOpts.prefetch);
    await channel.assertQueue(mqOpts.queue, { durable: true });

    return {
        channel,
        connection,
        state: { closing: false },
    };
}

export function observeBroker(
    { channel, connection, state }: Broker,
    log: Logger,
): void {
    channel.on("error", (err) => {
        log.error({ err }, "rabbitmq channel error");
    });
    channel.on("close", () => {
        log.warn("rabbitmq channel closed");
    });
    connection.on("error", (err) => {
        log.error({ err }, "rabbitmq connection error");
    });
    connection.on("close", () => {
        if (!state.closing) {
            log.error("rabbitmq connection closed unexpectedly");
        }
    });
}

export async function closeBroker(
    { channel, connection }: Broker,
    log: Logger,
): Promise<void> {
    try {
        await channel.close();
    } catch (err) {
        log.warn({ err }, "failed to close rabbitmq channel");
    }

    try {
        await connection.close();
    } catch (err) {
        log.warn({ err }, "failed to close rabbitmq connection");
    }
}
