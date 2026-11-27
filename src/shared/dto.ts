import type { Attachment } from "nodemailer";
import { z } from "zod";

const attachmentSchema = z.custom<Attachment>(
    (value) => typeof value === "object" && value !== null,
    { message: "Attachment must be an object" },
);

export const sendEmailRequestSchema = z
    .object({
        to: z.string().min(1, "Recipient is required"),
        subject: z.string(),
        text: z.string().optional(),
        html: z.string().optional(),
        template: z.string().optional(),
        data: z.record(z.string(), z.unknown()).optional(),
        attachments: z.array(attachmentSchema).optional(),
    })
    .refine(
        (value) => Boolean(value.text || value.html || value.template),
        {
            message: "Email body is required: provide text, html, or template",
            path: ["text"],
        },
    );

export type SendEmailRequest = z.infer<typeof sendEmailRequestSchema>;
