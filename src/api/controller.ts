import { Router } from "express";
import { sendEmail } from "../email/service.js";
import { sendEmailRequestSchema } from "../shared/dto.js";

export function EmailRouter(): Router {
    const router = Router();
    router.post("/", async (req, res) => {
        const result = sendEmailRequestSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                error: "Invalid request",
                issues: result.error.issues,
            });
            return;
        }

        await sendEmail(result.data);
        res.status(200).send();
    });
    return router;
}
