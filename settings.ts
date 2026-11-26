
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

export const emailFrom: string = process.env.emailFrom || "no-reply@mail.tcyao.com";
export const emailFromName: string | undefined = process.env.emailFromName || undefined;
