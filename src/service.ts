import { SentMessageInfo, Transporter } from "nodemailer";
import { convert } from "html-to-text";
import { createTransport } from "./client";
import { emailFrom, emailFromName, emailOpts } from "./settings";
import { SendEmailRequest } from "./dto";
import { renderTemplate } from "./template";


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
