import { z } from "zod";
import { sendEmail } from "../email/service.js";
import { sendEmailRequestSchema } from "../shared/dto.js";

export class InvalidEmailMessageError extends Error {
    readonly issues: z.ZodIssue[];

    constructor(issues: z.ZodIssue[]) {
        super("Invalid email message");
        this.name = "InvalidEmailMessageError";
        this.issues = issues;
    }
}

export async function executeEmailMessage(payload: unknown): Promise<void> {
    const parsed = sendEmailRequestSchema.safeParse(payload);
    if (!parsed.success) {
        throw new InvalidEmailMessageError(parsed.error.issues);
    }

    await sendEmail(parsed.data);
}
