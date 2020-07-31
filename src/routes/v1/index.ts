import { Express } from "express";
import { IConfiguration } from "../../Interfaces";

import documents from "./documents";

// join all routers in a single function
export default function index(app: Express, config: IConfiguration) {
    // setup the microservices API routes
    app.use("/api/v1", documents(config));
};