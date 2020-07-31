// Microservice Index
// The main file to run the service

// express related packages
import * as express from "express";
// request parsing packages
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";

// import and create logging objects
import logging from "./middleware/logging";
// import error handling objects
import { handleError, ErrorHandler } from "./library/error";

// import configurations
import config from "./config/config";

// initialize express app
const app = express();

// configure application
app.use(bodyParser.json({ limit: "10mb" })); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({              // to support URL-encoded bodies
    extended: true,
    limit: "10mb"
}));
app.use(cookieParser(config.sessionsecret));

// add session configurations
if (config.isProduction) {
    app.set("trust proxy", 1);
}
app.use(logging(
    "elasticsearch",
    "info",
    !config.isProduction
));

// set the API routes of all supported version
import index from "./routes/v1";
index(app, config);

// set all other routes not available
app.use("*", (req, res, next) => {
    next(new ErrorHandler(404, "Route not found"));
});

// custom error handler
app.use((err: ErrorHandler, req: express.Request, res: express.Response, next: express.NextFunction) => {
    return handleError(err, res);
});

// start the express server
const server = app.listen(config.port);

module.exports = server;