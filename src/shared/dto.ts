import type { Attachment } from "nodemailer";

export type SendEmailRequest = {
    to: string;
    subject: string,
    text?: string,
    html?: string,
    template?: string,
    data?: Record<string, unknown>,
    attachments?: Attachment[]
}
