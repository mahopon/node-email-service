import { Router } from "express";
import { sendEmail } from "../email/service.js";
import type { SendEmailRequest } from "../shared/dto.js";


export function EmailRouter(): Router {
    const router = Router();
    router.post("/", async (req, res) => {
        const body = req.body;
        let input: SendEmailRequest = {
            to: body.to,
            subject: body.subject,
            text: body.text,
            html: body.html,
            template: body.template,
            data: body.data,
            attachments: body.attachments
        };
        await sendEmail(input);
        res.status(200).send();
    });
    return router;
}
