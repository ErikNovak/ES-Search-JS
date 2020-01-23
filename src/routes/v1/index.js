/**
* @description Registers the version 1 API routes.
* @param {Object} app - Express app.
* @param {Object} config - The configuration object.
*/
module.exports = function (app, config) {
    // setup the microservices API routes
    app.use("/api/v1", require("./elasticsearch")(config));
};
