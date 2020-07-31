// interfaces
import * as ITransport from "winston-transport";

// logging packages
import * as winston from "winston";
import * as expressWinston from "express-winston";
// daily rotate file configuration
import DailyRotateFile = require("winston-daily-rotate-file");

// file creation modules
import * as path from "path";
// import the file system module
import * as fileSystem from "../library/file-system";

// the error objects
import { ErrorHandler } from "../library/error";

// transport creation function
const transportCreator = (filename: string, dirname: string, level: string) => {
    if (!filename) {
        throw new ErrorHandler(500, "Internal server error");
    }
    // create the basic daily transport
    return new (DailyRotateFile)({
        filename,
        dirname,
        datePattern: "YYYY-MM-DD",
        level,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    });
};

// creates the winston loggers
const createTransports = (filename: string, folder: string, level = "info", consoleFlag = true) => {
    const transports: ITransport[] = [];
    // add console logging transport to the instance
    if (consoleFlag) {
        transports.push(new winston.transports.Console({
            level,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.timestamp()
            )
        }));
    }
    // add a file rotation transport
    transports.push(transportCreator(filename, folder, level));
    return transports;
};

// exports the winston logger
export default (filename: string, level = "info", consoleFlag = true) => {
    // create the logs folder
    const folder = path.join(__dirname, "../../logs/");
    fileSystem.createDirectoryPath(folder);
    // create the transports for the given file
    const transports = createTransports(filename, folder, level, consoleFlag);
    // output the express winston middleware
    return expressWinston.logger({
        transports,
        meta: false,
        expressFormat: true,
        ignoreRoute: (req, res) => false
    });
};