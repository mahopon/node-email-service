import nodemailer from "nodemailer";
import { EmailOptions } from "./settings";

export function createTransport(emailOpts: EmailOptions) {
    return nodemailer.createTransport(emailOpts);
}


