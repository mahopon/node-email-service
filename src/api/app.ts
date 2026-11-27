import express, { type ErrorRequestHandler, type Express } from "express";
import { pinoHttp } from "pino-http";
import { EmailRouter } from "./controller.js";
import { logger } from "../shared/logger.js";

function createApp(): Express {
    const app = express();
    // Log every request, including health checks, once the response finishes.
    app.use(pinoHttp({ logger }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    app.get("/startup", (req,res) => {
        res.status(200).json({
            started: true   
        });
    });
    app.get("/health", (req, res) => {
        res.status(200).json({
            status: "up",
        });
    });

    app.get("/ready", (req, res) => {
        res.status(200).json({
            ready: true
        });
    });
    
    app.use("/email", EmailRouter());

    const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
        req.log.error({ err }, "request failed");
        if (res.headersSent) {
            next(err);
            return;
        }
        res.status(500).json({ error: "Internal server error" });
    };
    app.use(errorHandler);

    return app
}



export default createApp;
