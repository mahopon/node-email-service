import { readFileSync } from "node:fs";
import path from "node:path";
import * as ejs from "ejs";

const TEMPLATES_DIR = path.resolve(process.cwd(), "templates");
const VALID_NAME = /^[a-zA-Z0-9_-]+$/;

export function renderTemplate(name: string, data: Record<string, unknown> = {}): string {
    if (!VALID_NAME.test(name)) {
        throw new Error(`Invalid template name: ${name}`);
    }

    const file = path.join(TEMPLATES_DIR, `${name}.ejs`);
    const source = readFileSync(file, "utf8");

    // Values interpolated with <%= %> are HTML-escaped by EJS.
    return ejs.render(source, data, { filename: file });
}
