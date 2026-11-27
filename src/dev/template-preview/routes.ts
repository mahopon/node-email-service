import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router, type ErrorRequestHandler } from "express";
import { convert } from "html-to-text";
import { sendEmail } from "../../email/service.js";
import {
    isValidTemplateName,
    renderTemplate,
    renderTemplateSource,
    templatesDir,
} from "../../template/index.js";
import { templatePreviewPage } from "./page.js";

const TEMPLATE_EXT = ".njk";
const SAMPLE_EXT = ".data.json";
const TEXT_OPTIONS = { wordwrap: 80 } as const;

class HttpError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "HttpError";
        this.status = status;
    }
}

/**
 * Dev-only HTTP UI for editing, previewing and test-sending email templates.
 * Mounted from createApp() when NODE_ENV is not "production".
 */
export function templatePreviewRouter(): Router {
    const router = Router();

    router.use((_req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        next();
    });

    router.get("/", (_req, res) => {
        res.type("html").send(templatePreviewPage);
    });

    router.get("/api/templates", async (_req, res) => {
        const entries = await readdir(templatesDir, { withFileTypes: true });
        const templates = entries
            .filter((entry) => entry.isFile() && entry.name.endsWith(TEMPLATE_EXT))
            .map((entry) => entry.name.slice(0, -TEMPLATE_EXT.length))
            .filter(isValidTemplateName)
            .sort();

        res.json({ templates });
    });

    router.get("/api/templates/:name", async (req, res) => {
        const name = requireName(req.params.name);
        const source = await readTemplateSource(name);

        res.json({ name, source, sample: await readSample(name) });
    });

    router.put("/api/templates/:name", async (req, res) => {
        const name = requireName(req.params.name);
        const source = req.body?.source;
        const overwrite = req.body?.overwrite === true;

        if (typeof source !== "string") {
            throw new HttpError(400, "source must be a string");
        }

        // Refuse to persist a template that cannot render. Undefined variables
        // are fine (nunjucks renders them as empty); bad syntax/filters are not.
        try {
            renderTemplateSource(source, (await readSample(name)) ?? {});
        } catch (err) {
            throw new HttpError(400, errorMessage(err));
        }

        try {
            await writeFile(templatePath(name), source, {
                encoding: "utf8",
                // "wx" makes the existence check atomic: create, never clobber.
                flag: overwrite ? "w" : "wx",
            });
        } catch (err) {
            if (!overwrite && isErrno(err, "EEXIST")) {
                throw new HttpError(
                    409,
                    `Template already exists: ${name}${TEMPLATE_EXT}`,
                );
            }
            throw err;
        }

        res.json({ ok: true, name });
    });

    router.put("/api/templates/:name/sample", async (req, res) => {
        const name = requireName(req.params.name);
        const data = req.body?.data;

        if (!isPlainObject(data)) {
            throw new HttpError(400, "data must be a JSON object");
        }

        await writeFile(
            samplePath(name),
            `${JSON.stringify(data, null, 2)}\n`,
            "utf8",
        );
        res.json({ ok: true });
    });

    router.post("/api/render", async (req, res) => {
        const html = await renderFromRequest(req.body);
        res.json({ html, text: convert(html, TEXT_OPTIONS) });
    });

    router.post("/api/send", async (req, res) => {
        const { to, subject } = req.body ?? {};

        if (typeof to !== "string" || !to.trim()) {
            throw new HttpError(400, "to is required");
        }
        if (typeof subject !== "string") {
            throw new HttpError(400, "subject must be a string");
        }

        const html = await renderFromRequest(req.body);
        await sendEmail({
            to: to.trim(),
            subject,
            html,
            text: convert(html, TEXT_OPTIONS),
        });

        res.json({ ok: true });
    });

    const handleError: ErrorRequestHandler = (err, req, res, next) => {
        if (res.headersSent) {
            next(err);
            return;
        }
        if (err instanceof HttpError) {
            res.status(err.status).json({ error: err.message });
            return;
        }

        req.log.error({ err }, "template preview request failed");
        res.status(500).json({ error: errorMessage(err) });
    };
    router.use(handleError);

    return router;
}

async function renderFromRequest(body: unknown): Promise<string> {
    if (!isPlainObject(body)) {
        throw new HttpError(400, "request body must be a JSON object");
    }

    const { name, source } = body;
    const data = body.data ?? {};

    if (!isPlainObject(data)) {
        throw new HttpError(400, "data must be a JSON object");
    }

    try {
        if (typeof source === "string") {
            return renderTemplateSource(source, data);
        }
        return renderTemplate(requireName(name), data);
    } catch (err) {
        if (err instanceof HttpError) {
            throw err;
        }
        throw new HttpError(400, errorMessage(err));
    }
}

function requireName(value: unknown): string {
    if (typeof value !== "string" || !isValidTemplateName(value)) {
        throw new HttpError(
            400,
            "Invalid template name: use letters, numbers, '-', or '_'",
        );
    }
    return value;
}

function templatePath(name: string): string {
    return path.join(templatesDir, `${name}${TEMPLATE_EXT}`);
}

function samplePath(name: string): string {
    return path.join(templatesDir, `${name}${SAMPLE_EXT}`);
}

async function readTemplateSource(name: string): Promise<string> {
    try {
        return await readFile(templatePath(name), "utf8");
    } catch (err) {
        if (isErrno(err, "ENOENT")) {
            throw new HttpError(404, `Template not found: ${name}`);
        }
        throw err;
    }
}

async function readSample(
    name: string,
): Promise<Record<string, unknown> | null> {
    let raw: string;
    try {
        raw = await readFile(samplePath(name), "utf8");
    } catch (err) {
        if (isErrno(err, "ENOENT")) {
            return null;
        }
        throw err;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (err) {
        throw new HttpError(
            500,
            `Invalid sample data for ${name}: ${errorMessage(err)}`,
        );
    }

    if (!isPlainObject(parsed)) {
        throw new HttpError(
            500,
            `Sample data for ${name} must be a JSON object`,
        );
    }
    return parsed;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isErrno(err: unknown, code: string): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as NodeJS.ErrnoException).code === code
    );
}

function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}
