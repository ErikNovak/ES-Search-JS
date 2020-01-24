
// import elastic search client
const { Client } = require("@elastic/elasticsearch");

class ElasticSearch {
    /**
     * @description Creates and initializes the elasticsearch connection object.
     * @param {Object} params - The parameters used to connect to elasticsearch.
     * @param {String} params.node - The node to which the client connects.
     */
    constructor(params) {
        this.params = params;
        this.initializeClient();
    }

    /**
     * @description Initializes the client connection.
     */
    initializeClient() {
        this.client = new Client({
            node: this.params.node
        });
    }

    /**
     * @description Creates a new index in elasticsearch.
     * @param {Object} schema - The elasticsearch shema of the index.
     * @returns {Object} The elasticsearch index created object-
     */
    async createIndex(schema) {
        return await this.client.indices.create(schema);
    }

    /**
     * @description Removes the index from elasticsearch (if present).
     * @param {String} index - The index to be deleted from elasticsearch.
     * @returns {Object|Null} The elasticsearch index deleted object if the
     * index was previously present. Otherwise, null.
     */
    async deleteIndex(index) {
        if (await this.client.indices.exists({ index })) {
            return await this.client.indices.delete({ index });
        }
        return null;
    }

    /**
     * @description Refresh the index to enable elasticsearch functions.
     * @param {String} index - The name of the index to be refreshed.
     * @returns {Object} The elasticsearch refresh object.
     */
    async refreshIndex(index) {
        return await this.client.indices.refresh({ index });
    }

    /**
     * @description Adds a new record to the associated index.
     * @param {String} index - The name of the index.
     * @param {Object} body - The body of the record being pushed to the index.
     * @returns {Object} The elasticsearch record creation record.
     */
    async pushRecord(index, body) {
        return await this.client.index({
            index,
            body
        });
    }

    /**
     * @description Updates the associated document with the new values.
     * @param {String} index - The index in which the document is present.
     * @param {String} documentId - The document id.
     * @param {String} body - The content of the document to be updated.
     * @returns {Object} The elasticsearch update object.
     */
    async updateRecord(index, documentId, body) {
        return this.client.update({
            index,
            id: documentId,
            body
        });
    }

    /**
     * @description Deletes the document from the index.
     * @param {String} index - The indexin which the document is present.
     * @param {String} documentId - The document id.
     * @returns {Object} The elasticsearch delete object.
     */
    async deleteRecord(index, documentId) {
        return this.client.delete({
            id: documentId,
            index
        });
    }

    /**
     * @description Searches through elasticsearch for the records
     * @param {Object} schema - The elasticsearch search object.
     * @returns {Object} The body of the elasticsearch search response.
     */
    async search(index, schema) {
        const { body } = await this.client.search({
            index,
            body: schema
        });
        return body;
    }
}

module.exports = ElasticSearch;
