// import elastic search client
import { Client, ClientOptions, RequestParams } from "@elastic/elasticsearch";

export default class Elasticsearch {

    private params: ClientOptions;
    private client: Client;

    // creates and initializes the elasticsearch connection object
    constructor(params: ClientOptions) {
        this.params = params;
        this.initializeClient();
    }

    // initializes the client connection.
    initializeClient() {
        this.client = new Client({
            node: this.params.node
        });
    }

    // creates a new index in elasticsearch
    async createIndex(schema: RequestParams.IndicesCreate) {
        return await this.client.indices.create(schema);
    }

    // removes the index from elasticsearch (if present).
    async deleteIndex(index: string) {
        const { body: exists } = await this.client.indices.exists({ index });
        if (exists) {
            return await this.client.indices.delete({ index });
        }
        return null;
    }

    // refresh the index to enable elasticsearch functions.
    async refreshIndex(index: string) {
        return await this.client.indices.refresh({ index });
    }

    // adds a new record to the associated index
    async pushRecord(index: string, body: object, recordId = null) {
        return await this.client.index({
            ...recordId && { id: recordId },
            index,
            body
        });
    }

    // updates the associated document with the new values
    async updateRecord(index: string, recordId: string, body: object) {
        return await this.client.update({
            index,
            type: "_doc",
            id: recordId,
            body: { doc: body }
        });
    }

    // deletes the document from the index
    async deleteRecord(index: string, recordId: string) {
        return await this.client.delete({
            id: recordId,
            index
        });
    }

    // searches through elasticsearch for the records
    async search(index: string, schema: object) {
        const { body } = await this.client.search({
            index,
            body: schema
        });
        return body;
    }
}