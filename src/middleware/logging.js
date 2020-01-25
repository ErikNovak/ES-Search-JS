// logging packages
const winston = require("winston");
const expressWinston = require("express-winston");
// daily rotate file configuration
require("winston-daily-rotate-file");

// import the file system module
const fileSystem = require("../library/file-system");

// archive required modules
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

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
    let transport = new (winston.transports.DailyRotateFile)({
        filename,
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

    /**
     * @description Generates the file name used in the file rotation.
     * @param {String} level - The level of the transport.
     * @param {String} year - The year of the log creation.
     * @param {String} month - The month of the log creation.
     * @returns {String} The name of the file for its rotation.
     */
    function createFilename(level, year, month) {
        return `${year}-${month}-${level}`;
    }

    // set the rotate function / archive the previous month of logs
    transport.on("rotate", async (oldFilename, newFilename) => {
        // get dates of the filenames
        const oldDate = oldFilename.split(".")[1].split("-");
        const newDate = newFilename.split(".")[1].split("-");
        // create a folder to store the old files (format: YYYY-MM)
        const monthFolderPath = path.join(dirname,
            createFilename(level, oldDate[0], oldDate[1]));

        fileSystem.createFolder(monthFolderPath);

        // move old file to the corresponding folder
        fileSystem.moveFile(oldFilename,
            path.join(monthFolderPath, path.basename(oldFilename)));

        // if the months don't match
        if (oldDate[1] !== newDate[1]) {
            // get second-to-last month and year
            let tempMonth = parseInt(oldDate[1]) - 1;

            const prevMonth = tempMonth === 0 ? 12 : tempMonth;
            const prevYear = prevMonth === 12 ? oldDate[0] - 1 : oldDate[0];

            // check if the second-to-last month folder exists
            const prevFolderPath = path.join(dirname,
                createFilename(level, prevYear, (`0${prevMonth}`).slice(-2)));

            if (fs.existsSync(prevFolderPath)) {
                // archive second-to-last log folders
                // only the current and previous month logs are not archived
                const output = fs.createWriteStream(`${prevFolderPath}.tar.gz`);
                // zip up the archive folders
                let archive = archiver("tar", {
                    gzip: true,
                    gzipOptions: { level: 9 } // set the compression level
                });
                // set the output of the arhive
                archive.pipe(output);
                // catching warnings
                archive.on("warning", (error) => {
                    if (error.code === "ENOENT") {
                        // logging errors
                    } else {
                        throw new ErrorHandler(500, "Internal server error");
                    }
                });
                archive.on("error", (error) => {
                    throw new ErrorHandler(500, "Internal server error");
                });
                // append files from the directory
                archive.directory(prevFolderPath, false);
                // finalize the archive and remove the original folder
                await archive.finalize();
                fileSystem.removeFolder(prevFolderPath);
            }
        }
    });
    return transport;
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
