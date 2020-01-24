/**
 * ElasticSearch API
 * The API routes associated with retrieving and
 * manipuating data from Elastic Search.
 */

const router = require("express").Router();
const ElasticSearch = require("../../library/elasticsearch");
const { ErrorHandler } = require("../../library/error");

/**
 * @description Assign the elasticsearch API routes.
 * @param {Object} config - The configuration object.
 */
module.exports = (config) => {
    // esablish connection with elasticsearch
    const es = new ElasticSearch(config.elasticsearch);

    // TODO: assign the appropriate routes and their functions

    router.get("/elasticsearch", async (req, res) => {
        // TODO: extract the appropriate query parameters
        const {
            query: {
                text
            }
        } = req;

        // TODO: assign the appropriate index (possibly from the query?)
        const index = null;
        // TODO: assign the elasticsearch query object
        // see: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_search
        const body = null;

        try {
            // get the search results from elasticsearch
            const results = await es.search(index, body);
            // TODO: retrieve and format the output before sending
            res.json(results.hits.hits);
        } catch (error) {
            throw new ErrorHandler(500, "Internal server error");
        }
    });

    // return the router
    return router;
};
