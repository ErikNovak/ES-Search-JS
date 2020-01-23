/**
 * ElasticSearch API
 * The API routes associated with retrieving and
 * manipuating data from Elastic Search.
 */

const router = require("express").Router();
const { ErrorHandler } = require("../../library/error");

/**
 * @description Assign the elasticsearch API routes.
 * @param {Object} config - The configuration object.
 */
module.exports = (config) => {
    // TODO: assign the appropriate routes and their functions
    // for using elasticsearch
    router.get("/", (req, res) => res.json({ test: "this is the test" }));

    router.get("/error", (req, res) => {
        throw new ErrorHandler(500, "Internal server error");
    });

    // return the router
    return router;
};
