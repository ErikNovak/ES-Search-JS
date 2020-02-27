// logging packages
const winston = require("winston");
const expressWinston = require("express-winston");
// daily rotate file configuration
require("winston-daily-rotate-file");

// import the file system module
const fileSystem = require("../library/file-system");

// archive required modules
const path = require("path");

// the error objects
const { ErrorHandler } = require("../library/error");

/**
 * @description Creates the daily rotation transport.
 * @param {String} filename - The filename of the logger.
 * @param {String} dirname - The directory in which the logs are stored.
 * @param {String} level - The winston level.
 * @returns {Object} The configurated daily rotation transport.
 */
const transportCreator = (filename, dirname, level) => {
    if (!filename) {
        throw new ErrorHandler(500, "Internal server error");
    }
    // create the basic daily transport
    return new (winston.transports.DailyRotateFile)({
        filename: `${filename}-${level}`,
        dirname,
        datePattern: "YYYY-MM-DD",
        name: filename,
        level,
        prepend: false,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )
    });
};

/**
 * @description Creates the winston loggers.
 * @param {String} filename - The file name of where the logs are stored.
 * @param {String} folder - The folder name.
 * @param {String} level - The winston level.
 * @param {Boolean} consoleFlag - The flag stating if the logger should
 * also output on the console.
 * @returns {Object[]} The transports objects.
 */
const createTransports = (filename, folder, level = "info", consoleFlag = true) => {
    let transports = [];
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

/**
 * @description Generates the winston middleware.
 * @param {String} filename - The file name where the logs are stored.
 * @param {String} level - The winston level.
 * @param {Boolean} consoleFlag - The console flag specifying if the
 * middleware should output to the console.
 * @returns {Object} The winston middleware.
 */
module.exports = (filename, level = "info", consoleFlag = true) => {
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
