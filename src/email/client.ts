import nodemailer from "nodemailer";
import type { EmailOptions } from "./settings.js";

export function createTransport(emailOpts: EmailOptions) {
    return nodemailer.createTransport(emailOpts);
}


