import path from "node:path";
import * as nunjucks from "nunjucks";

const TEMPLATES_DIR = path.resolve(process.cwd(), "templates");
const VALID_NAME = /^[a-zA-Z0-9_-]+$/;

const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(TEMPLATES_DIR, {
        noCache: process.env.NODE_ENV !== "production",
    }),
    { autoescape: true },
);

export function renderTemplate(name: string, data: Record<string, unknown> = {}): string {
    if (!VALID_NAME.test(name)) {
        throw new Error(`Invalid template name: ${name}`);
    }

    return env.render(`${name}.njk`, data);
}
