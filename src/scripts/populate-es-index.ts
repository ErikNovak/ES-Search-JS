
// import required modules
import ElasticSearch from "../library/elasticsearch";
// import configurations
import config from "../config/config";

// --------------------------------------
// Establish connection with elasticsearch
// --------------------------------------

const es = new ElasticSearch(config.elasticsearch);

// assign the index name (from the config file)
const esIndex = config.elasticsearch.index;

// --------------------------------------
// Prepare documents to be indexed
// --------------------------------------
const documents = [];


async function createIndex() {
    // --------------------------------------
    // Populate the new index
    // --------------------------------------

    const indexDocuments = [];
    for (const document of documents) {
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
    console.log(error);
});
