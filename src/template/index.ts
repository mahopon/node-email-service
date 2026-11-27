import path from "node:path";
import * as nunjucks from "nunjucks";

const TEMPLATES_DIR = path.resolve(process.cwd(), "templates");
const VALID_NAME = /^[a-zA-Z0-9_-]+$/;

export const templatesDir = TEMPLATES_DIR;

export function isValidTemplateName(name: string): boolean {
    return VALID_NAME.test(name);
}

const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(TEMPLATES_DIR, {
        noCache: process.env.NODE_ENV !== "production",
    }),
    { autoescape: true },
);

export function renderTemplate(name: string, data: Record<string, unknown> = {}): string {
    if (!isValidTemplateName(name)) {
        throw new Error(`Invalid template name: ${name}`);
    }

    return env.render(`${name}.njk`, data);
}

/** Render template source directly, for previewing unsaved edits. */
export function renderTemplateSource(
    source: string,
    data: Record<string, unknown> = {},
): string {
    return env.renderString(source, data);
}
