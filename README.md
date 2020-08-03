# ES-Service-JS

[![Build Status](https://travis-ci.com/ErikNovak/ES-Service-JS.svg?branch=master)](https://travis-ci.com/ErikNovak/ES-Service-JS)
![Node](https://img.shields.io/badge/node-%3E%3D%2010.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-linux-green.svg)
[![License](https://img.shields.io/badge/License-BSD%202--Clause-green.svg)](https://opensource.org/licenses/BSD-2-Clause)

The template repository for setting up the NodeJS microservice for connecting and using [ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html).

## Prerequisites
- A running elasticsearch service (one can download and install it from [here](https://www.elastic.co/downloads/elasticsearch))
- NodeJS version 10 or greater

  To test that your nodejs version is correct, run `node --version` in the command line.

## Install

To install the project run
```bash
npm install
```

### Setting up the microservice

After the installation process, one must modify the following files to meet the microservices' requirements:

- **Setting up the configuration file.** One must prepare the configuration file in the [config](./src/config) folder.

- **Updating the elasticsearch indexing script.** To create and populate the elasticsearch index, try modifying and using the [create-elasticsearch-index.js](./src/load/create-elasticsearch-index.js) file to speed up the process.

- **Modify the microservice routes.** Once the elasticsearch index is set, the final thing to be updated is the elasticsearch route located [here](./src/routes/v1/elasticsearch.ts). Check and configure the file to match the microservices' needs.


## Starting the microservice
To start the microservice in development mode run the following command
```bash
npm start
```

### Starting the microservice in development mode
When developing a microservice (or any other web service) it is tedius to constantly stop and start the server to include the changes done in the code.

That is why we included a nodejs package called [nodemon](https://www.npmjs.com/package/nodemon) which helps develop node.js based applications by automatically restarting the node application when file changes in the directory are detected.

Nodemon is already part of this microservice's development process and can be used by simply running

```bash
npm run development
```

### Starting the microservice in different environment (mode)
To start the microservice in a different environment (or mode), such as `production` or `test`, simply run one of the following

```bash
# production mode
NODE_ENV=production node ./src/index.js

# development mode
NODE_ENV=development node ./src/index.js

# test mode
NODE_ENV=development node ./src/index.js
```