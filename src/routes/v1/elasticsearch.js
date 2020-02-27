/**
 * ElasticSearch API
 * The API routes associated with retrieving and
 * manipuating data from elasticsearch.
 * https://www.elastic.co/elasticsearch
 */

const router = require("express").Router();
const ElasticSearch = require("../../library/elasticsearch");
const { ErrorHandler } = require("../../library/error");

// validating the query parameters
const { query, body, param } = require("express-validator");

// creation of the query string to help the user navigate through
const querystring = require("querystring");

// ----------------------------------------------
// Helper functions in route
// ----------------------------------------------

/**
 * @description Formats the elasticsearch document.
 * @param {Object} hit - The elasticsearch document hit object containing the document attributes.
 * @returns {Object} The formatted document hit object.
 */
function formatHitDocument(hit) {
    return {
        weight: hit._score,
        // TODO: add additional values
    };
}

// TODO: add helper functions (if required)

/**
 * @description Assign the elasticsearch API routes.
 * @param {Object} config - The configuration object.
 */
module.exports = (config) => {
    // esablish connection with elasticsearch
    const es = new ElasticSearch(config.elasticsearch);

    // set default parameters
    const DEFAULT_LIMIT = 20;
    const MAX_LIMIT = 100;
    const DEFAULT_PAGE = 1;
    const BASE_URL = `http://localhost:${config.port}/api/v1/elasticsearch`;
    // assign the index name (from the config file)
    const esIndex = config.elasticsearch.index;

    // TODO: specify additional default values (if needed)


    /**
     * @api {GET} /api/v1/documents Search through the documents.
     * @apiVersion 1.0.0
     * @apiName searchAPI
     * @apiGroup search
     */
    router.get("/documents", [
        query("text").trim(),
        query("limit").optional().toInt(),
        query("page").optional().toInt(),
        // TODO: add query parameters (if required)
    ], async (req, res, next) => {
        // extract the appropriate query parameters
        let {
            query: {
                text,
                limit,
                page
                // TODO: get other query parameters
            }
        } = req;

        // --------------------------------------
        // Check required query parameters
        // --------------------------------------

        if (!text) {
            return res.status(400).json({
                message: "query parameter 'text' not available",
                query: req.query
            });
        }

        // --------------------------------------
        // Set pagination parameters
        // --------------------------------------

        // set default pagination values
        if (!limit) {
            limit = DEFAULT_LIMIT;
        } else if (limit <= 0) {
            limit = DEFAULT_LIMIT;
        } else if (limit >= MAX_LIMIT) {
            limit = MAX_LIMIT;
        }
        req.query.limit = limit;
        if (!page) {
            page = DEFAULT_PAGE;
            req.query.page = page;
        }

        // which part of the documents do we want to query
        const size = limit;
        const from = (page - 1) * size;

        // --------------------------------------
        // Set query parameters
        // --------------------------------------

        // TODO: assign the query parameters
        // see https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html

        // --------------------------------------
        // Set filter parameters
        // --------------------------------------

        // TODO: assign the filter parameters

        // --------------------------------------
        // Set the elasticsearch query body
        // see: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_search
        // --------------------------------------

        const body = {
            from, // set the from parameter from the "limit", "page" params
            size, // set the from parameter from the "limit", "page" params
            _source: {
                excludes: [] // exclude the following document attributes from the results
            },
            query: {
                bool: {
                    must: [{ }], // what must be in the documents
                    should: [{ }], // what should be in the documents
                    must_not: [{ }] // what must not be in the documents
                },
                filter: [{ }] // filter out documents that match the condition
            },
            // aggs: { }, // get additional aggregates (statistics) about the results
            // min_score: 5, // return only documents that have a score greater than `min_score`
            track_total_hits: true
        };

        try {
            // --------------------------------------
            // Get the search results
            // --------------------------------------

            const results = await es.search(esIndex, body);

            // --------------------------------------
            // Format the results before sending
            // --------------------------------------

            const output = results.hits.hits.map(formatHitDocument);

            // --------------------------------------
            // Add additional metadata to response
            // --------------------------------------

            const prevQuery = {
                ...req.query,
                ...page && { page: page - 1 }
            };

            const nextQuery = {
                ...req.query,
                ...page && { page: page + 1 }
            };

            const total_hits = results.hits.total.value;
            const total_pages = Math.ceil(results.hits.total.value / size);
            const prev_page = page - 1 > 0 ? `${BASE_URL}?${querystring.stringify(prevQuery)}` : null;
            const next_page = total_pages >= page + 1 ? `${BASE_URL}?${querystring.stringify(nextQuery)}` : null;

            // --------------------------------------
            // Return the results
            // --------------------------------------

            return res.status(200).json({
                query: req.query,
                documents: output,
                metadata: {
                    total_hits,
                    total_pages,
                    prev_page,
                    next_page,
                    // aggregations: results.aggregations // TODO: modify the aggreations when used
                }
            });
        } catch (error) {
            return next(new ErrorHandler(500, "Internal server error"));
        }
    });

    /**
     * @api {POST} /api/v1/documents Add a new document to the elasticsearch index.
     * @apiVersion 1.0.0
     * @apiName esSearchAPI
     * @apiGroup search
     */
    router.post("/documents", async (req, res, next) => {
        const {
            body: {
                document
            }
        } = req;

        // --------------------------------------
        // Additional formatting
        // --------------------------------------

        // TODO: Provide additional formatting (if required)

        try {
            // --------------------------------------
            // Push the record in elasticsearch index
            // --------------------------------------

            await es.pushRecord(esIndex, document /* , record.material_id */);

            // --------------------------------------
            // Refresh the index
            // --------------------------------------

            await es.refreshIndex(esIndex);

            // --------------------------------------
            // Return the response
            // --------------------------------------

            return res.status(200).json({ message: "document pushed to the index" });
        } catch (error) {
            return next(new ErrorHandler(500, "Internal server error"));
        }
    });


    /**
     * @api {GET} /api/v1/documents/document_id Get a specific document.
     * @apiVersion 1.0.0
     * @apiName esSearchAPI
     * @apiGroup search
     */
    router.get("/documents/:document_id", [
        param("document_id").toInt(),
    ], async (req, res, next) => {
        const {
            params: {
                document_id
            },
        } = req;

        // --------------------------------------
        // Check required query parameters
        // --------------------------------------

        if (!document_id) {
            return res.status(400).json({
                message: "body parameter document_id not an integer",
                query: { document_id }
            });
        }

        // --------------------------------------
        // Set the elasticsearch query body
        // see: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#_search
        // --------------------------------------

        const body = {
            query: { terms: { _id: [document_id] } }
        };

        try {
            // --------------------------------------
            // Get the search results
            // --------------------------------------

            const results = await es.search(esIndex, body);

            // --------------------------------------
            // Format the results before sending
            // --------------------------------------

            const output = results.hits.hits.map(formatHitDocument)[0];

            // --------------------------------------
            // Return the results
            // --------------------------------------

            return res.status(200).json({
                params: req.params,
                documents: output
            });
        } catch (error) {
            return next(new ErrorHandler(500, "Internal server error"));
        }
    });


    /**
     * @api {PATCH} /api/v1/documents/document_id Update the document in the elasticsearch index.
     * @apiVersion 1.0.0
     * @apiName esSearchAPI
     * @apiGroup search
     */
    router.patch("/documents/:document_id", [
        param("document_id").toInt(),
    ], async (req, res, next) => {
        const {
            params: { document_id },
            body: { document }
        } = req;

        // --------------------------------------
        // Check required query parameters
        // --------------------------------------

        if (!document_id) {
            return res.status(400).json({
                message: "body parameter document_id not an integer",
                query: { document_id }
            });
        }

        // --------------------------------------
        // Additional formatting
        // --------------------------------------

        // TODO: Provide additional formatting (if required)

        try {
            // --------------------------------------
            // Update the record in elasticsearch index
            // --------------------------------------

            await es.updateRecord(esIndex, document_id, document);

            // --------------------------------------
            // Refresh the index
            // --------------------------------------

            await es.refreshIndex(esIndex);

            // --------------------------------------
            // Return the response
            // --------------------------------------

            return res.status(200).json({ message: "document updated to the index" });
        } catch (error) {
            return next(new ErrorHandler(500, "Internal server error"));
        }
    });


    /**
     * @api {DELETE} /api/v1/documents/document_id Delete the document from the elasticsearch index.
     * @apiVersion 1.0.0
     * @apiName esSearchAPI
     * @apiGroup search
     */
    router.delete("/document/:document_id", [
        param("document_id").toInt()
    ], async (req, res, next) => {
        const {
            params: { document_id }
        } = req;

        try {
            // --------------------------------------
            // Update the record in elasticsearch index
            // --------------------------------------

            await es.deleteRecord(esIndex, document_id);

            // --------------------------------------
            // Refresh the index
            // --------------------------------------

            await es.refreshIndex(esIndex);

            // --------------------------------------
            // Return the response
            // --------------------------------------

            return res.status(200).json({ message: "record deleted in the index" });
        } catch (error) {
            return next(new ErrorHandler(500, "Internal server error"));
        }
    });

    // return the router
    return router;
};
