
// import required modules
const ElasticSearch = require("../library/elasticsearch");

// get configuration object
const config = require("../config/config");

// --------------------------------------
// Establish connection with elasticsearch
// --------------------------------------

const es = new ElasticSearch(config.elasticsearch);

// assign the index name (from the config file)
const esIndex = config.elasticsearch.index;

// --------------------------------------
// Prepare documents to be indexed
// --------------------------------------

// TODO: prepare documents
const documents = [];

async function createIndex() {
    // --------------------------------------
    // Delete the index (if exists)
    // --------------------------------------
    await es.deleteIndex(esIndex);

    // --------------------------------------
    // Assign the index to be created
    // --------------------------------------

    // TODO: assign the correct index schema
    await es.createIndex({
        index: esIndex,
        body: {
            // mapping is the process of defining how a document and the fields it contains are stored
            // see: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html

            mapping: {
                properties: {
                    // each attribute has its own field (except of the array type)
                    // see: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html

                    document_id: { type: "long" }, // one of the many number types
                    title: { type: "text" }, // used for text search
                    date: { type: "date" }, // used to time interval search
                    language: { type: "keyword" }, // used for exact keyword search

                    // used to provide a hierarchical structure of data but are flatten internally
                    // see: https://www.elastic.co/guide/en/elasticsearch/reference/current/object.html
                    metadata: {
                        type: "object",
                        properties: {
                            // similar as above
                        }
                    },

                    // specialized version of the 'object' datatype, allows arrays of object
                    // to be indexed in a way that they can be queried independently of each other
                    // see: https://www.elastic.co/guide/en/elasticsearch/reference/current/nested.html
                    wikipedia: {
                        type: "nested",
                        properties: {
                            // similar as above
                        }
                    }
                }
            }
        }
    });

    // --------------------------------------
    // Populate the new index
    // --------------------------------------

    const indexDocuments = [];
    for (let document of documents) {
        // the last parameter is optional but helpful when querying for a specific document
        indexDocuments.push(es.pushRecord(esIndex, document /* , document.document_id */));
    }
    await Promise.all(indexDocuments);

    // --------------------------------------
    // Refresh the index
    // --------------------------------------

    // refresh the index for full search support
    // not refreshing index might cause that the new
    // documents won't be included in the results
    await es.refreshIndex(esIndex);
}

createIndex().catch((error) => {
    console.log(error.meta.body);
});
