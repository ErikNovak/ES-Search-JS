/**
 * Microservice configuration variables
 * It generates the configuration object used across
 * the microservice. This object contains the environment
 * variables.
 */

// external modules
const path = require("path");

// import the secret node variables
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// get process environment
const env = process.env.NODE_ENV || "development";

// the common environment
const common = {
    environment: env
    // TODO: add common variables
};

// production environment variables
const production = {
    // TODO: add production variables
    port: parseInt(process.env.PROD_PORT) || 3100,
    sessionsecret: process.env.PROD_SESSION_SECRET,
    elasticsearch: {
        node: process.env.PROD_ELASTICSEARCH_NODE,
        index: process.env.PROD_ELASTICSEARCH_INDEX
    }
};

// development environment variables
const development = {
    // TODO: add development variables
    port: parseInt(process.env.DEV_PORT) || 3101,
    sessionsecret: process.env.DEV_SESSION_SECRET,
    elasticsearch: {
        node: process.env.DEV_ELASTICSEARCH_NODE,
        index: process.env.DEV_ELASTICSEARCH_INDEX
    }
};

// test environment variables
const test = {
    // TODO: add test variables
    port: parseInt(process.env.TEST_PORT) || 3102,
    sessionsecret: process.env.TEST_SESSION_SECRET,
    elasticsearch: {
        node: process.env.TEST_ELASTICSEARCH_NODE,
        index: process.env.TEST_ELASTICSEARCH_INDEX
    }
};

const config = {
    production,
    development,
    test
};

/**
 * Creates a deep merge between two JSON objects.
 * @param {Object} target - The target json object.
 * @param {Object} source - The soruce json object.
 * @returns {Object} The merged JSON as the `target` object.
 */
function merge(target, source) {
    // Iterate through `source` properties
    // If an `Object` set property to merge of `target` and `source` properties
    for (let key of Object.keys(source)) {
        if (source[key] instanceof Object) {
            Object.assign(source[key], merge(target[key], source[key]));
        }
    }
    // Join `target` and modified `source`
    Object.assign(target || {}, source);
    return target;
}

// export the environment variables
module.exports = merge(common, config[env]);
