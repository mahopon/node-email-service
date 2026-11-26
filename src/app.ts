import express, { type Express } from "express";
import { EmailRouter } from "./controller.js";

function createApp(): Express {
    const app = express();
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
    return app
}



export default createApp;
