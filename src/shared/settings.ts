
export interface EmailOptions {
    host: string,
    port: number,
    secure: boolean,
    service: string,
    auth: {
        user: string,
        pass: string
    }
}

export interface MqOptions {
    url: string,
    queue: string,
    prefetch: number
}

export const emailOpts: EmailOptions = {
    host: process.env.emailHost || "",
    port: Number(process.env.emailPort) || 587,
    secure: process.env.emailSecure === "true",
    service: process.env.emailService || "",
    auth: {
        user: process.env.emailUser || "",
        pass: process.env.emailPassword || ""
    }
}

export const mqOpts: MqOptions = {
    url: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "email",
    prefetch: Number(process.env.RABBITMQ_PREFETCH) || 5
}

export const emailFrom: string = process.env.emailFrom || "no-reply@mail.tcyao.com";
export const emailFromName: string | undefined = process.env.emailFromName || undefined;
