# Configuration

This folder contains the configuration files.

## Environment Variables

To avoid storing vulnerable data in the repository (such as authentication tokens and secrets) we have adopted the `.env` approach to feed the vulnerable data to different components of the platform.

This approach requires the `dotenv` module (which is installed by running the `npm install` command) and an `.env` file saved in this folder. One must create the `.env` file by hand since it is ignored in the project.

### .env
What follows is an example of the `.env` file. To get the right tokens contact one of the developers contributing to this project.


```bash
#######################################
### Production variables
#######################################

PROD_PORT={production-service-port: integer}
PROD_SESSION_SECRET={production-session-secret: string}
PROD_ELASTICSEARCH_NODE={production-elasticsearch-node: address:port} i.e.http://127.0.0.1:9200
PROD_ELASTICSEARCH_INDEX=documents

#######################################
### Development variables
#######################################

DEV_PORT={development-service-port: integer}
DEV_SESSION_SECRET={development-session-secret: string}
DEV_ELASTICSEARCH_NODE={development-elasticsearch-node: address:port} i.e.http://127.0.0.1:9200
DEV_ELASTICSEARCH_INDEX=documents

#######################################
### Test variables
#######################################

TEST_PORT={test-service-port: integer}
TEST_SESSION_SECRET={test-session-secret: string}
TEST_ELASTICSEARCH_NODE={test-elasticsearch-node: address:port} i.e.http://127.0.0.1:9200
TEST_ELASTICSEARCH_INDEX=documents
```
