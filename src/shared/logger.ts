import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";
const prettyLogs = process.env.LOG_PRETTY === "true";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    base: {
        service: process.env.SERVICE_NAME ?? "email",
        env: process.env.NODE_ENV ?? "development",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "*.password",
            "*.emailPassword",
        ],
        censor: "[redacted]",
    },
    serializers: {
        err: pino.stdSerializers.err,
    },
    ...(prettyLogs && !isProduction
        ? {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },
        }
        : {}),
});
