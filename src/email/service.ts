import type { SentMessageInfo, Transporter } from "nodemailer";
import { convert } from "html-to-text";
import { createTransport } from "./client.js";
import { emailFrom, emailFromName, emailOpts } from "./settings.js";
import type { SendEmailRequest } from "./dto.js";
import { renderTemplate } from "./template.js";


const transport: Transporter = createTransport(emailOpts);
export const sendEmail = async (emailDetails: SendEmailRequest) => {
    let from = emailFromName
        ? { name: emailFromName, address: emailFrom }
        : emailFrom;
    let to = emailDetails.to;
    let subject = emailDetails.subject;

    let html = emailDetails.html;
    if (!html && emailDetails.template) {
        html = renderTemplate(emailDetails.template, emailDetails.data);
    }

    let text = emailDetails.text;
    if (!text && html) {
        text = convert(html, { wordwrap: 80 });
    }
    if (!html && !text) {
        throw new Error("Email body is required: provide text, html, or template");
    }

    let attachments = emailDetails.attachments || [];
    await transport.sendMail({
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments
    });
}
