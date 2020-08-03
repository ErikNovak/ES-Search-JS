# Scripts

## Populate Elasticsearch Index

One can populate the elasticsearch index in one of two ways:

1. Manually populate it using the template scripts: [create-es-index.ts](./create-es-index.ts)
and [populate-es-index.ts](./populate-es-index.ts).
2. Use Logstash and configure it to automatically sync a database (i.e. PostgreSQL) with the elasticsearch.

The first way has all required comments in the two template scripts, while the second requires more explanation.

## Populating Index with Logstash

[Logstash](https://www.elastic.co/logstash) is a free and open server-side data processing pipeline that
ingests data from a multitude of sources, transforms it, and then sends it to your favorite "stash."
The full documentation of Logstash is available [here](https://www.elastic.co/guide/en/logstash/current/introduction.html).


This section describes how one can use it on UNIX to migrate data from a PostgreSQL database to
elasticsearch.

### The Prerequisites

- PostgreSQL version 10 or higher
- Java version 10 or higher

### Process

1. **Download and Install Logstash.** The [instructions](https://www.elastic.co/downloads/logstash) tell how to install it
   on different operating systems. For Linux, one run these commands:
    ```bash
    # install logstash
    sudo apt install logstash -y
    # enable logstash
    sudo systemctl enable logstash
    ```

    Once installed, the service associated files will be located at: `/usr/share/logstash`.


2. **Download and Activate the JDBC Plugin.** JDBC (Java Database Connectivity) is an application programming interface (API) for JAVA,
   which defines how a client may access a database. We will use this plugin to enable Logstash to connect to the PostgreSQL
   database and retrieve records from it.

    **NOTE:** The Logstash plugins are located at: `/usr/share/logstash/bin/logstash-plugin`

   JDBC libraries vary based on the database. Here, we will download the PostgreSQL JDBC library.

    - Find the newest JDBC library on this [link](https://jdbc.postgresql.org/download.html#current)
    - Copy the latest link and download it using `curl` by running the following command:

        ```bash
        sudo curl https://jdbc.postgresql.org/download/postgresql-{version}.jar -o /usr/share/logstash/logstash-core/lib/jars/postgresql-jdbc.jar
        ```
        **NOTE:** Change the `{version}` with the desired library version.

    - Enable the JDBC plugin in Logstash by running the following command:

        ```bash
        sudo /usr/share/logstash/bin/logstash-plugin install logstash-input-jdbc
        ```

3. **Configure Logstash to Pull Records.** For Logstash to pull records from PostgreSQL, one must create
    a configuration file in `/usr/share/logstash/conf.d/` folder. How to configure a Logstash pipeline
    is presented [here](https://www.elastic.co/guide/en/logstash/current/configuration.html). In this section,
    we will provide a template for connecting to PostgreSQL, retrieving the records, modifying them, and
    sending them to Elasticsearch.

    ```bash
    input {
        jdbc {
            jdbc_connection_string => "jdbc:postgresql://localhost:5432/{pg_database}"
            jdbc_user => "{pg_username}"
            jdbc_password => "{pg_password}"
            jdbc_driver_class => "org.postgresql.Driver"
            schedule => "* * * * *" # cronjob schedule format
            codec => "json"
            statement => "SELECT * FROM public.{pg_table};"
        }
    }

    filter {
        mutate {
            # list of fields to remove from the pg input (fields as string)
            remove_field => ["{pg_table_column_1}", "{pg_table_column_2}"]
            # substitutes (replaces) parts of the value in {pg_table_column_i}
            # that matches {regex_i} with {value_i}
            gsub => [
                "{pg_table_column_3}", "{regex_1}", "{value_1}",
                "{pg_table_column_4}", "{regex_2}", "{value_2}"
            ]
        }
        # this part is used to parse jsonb type of values
        mutate {
            join => { "{pg_table_column_5}" => "," }
            replace => { "{pg_table_column_5}" => "[%{{pg_table_column_5}}]" }
        }
        json {
            source => "{pg_table_column_5}"
            target => "{pg_table_column_5}"
        }
    }

    output {
        # used to output the values in the terminal (DEBUGGING)
        # once everything is working, comment out this line
        stdout { codec => "json" }
        # used to output the values into elasticsearch
        elasticsearch {
            hosts => ["{es_host_address_1}"]
            index => "{es_index}"
            document_id => "document_%{{pg_table_column_id}}"
            doc_as_upsert => true # upserts documents (e.g. if the document does not exist, creates a new record)
        }
    }
    ```

4. **Test the Logstash Configuration.** Logstash supports running a specific
   configuration by passing its file path to the `-f` parameter. Run the
   following command to test your new configuration from the last step:
   ```bash
    sudo /usr/share/logstash/bin/logstash -f /etc/logstash/conf.d/{config_name}.conf
   ```

    Check the output to see if the configuration is working accordingly.

5. **Start the Logstash service.** Once the configuration is working as it should,
   you can start (or restart) the Logstash service by running the command:

   ```bash
   # to start the service
   sudo systemctl start logstash
   # to restart the service
   sudo systemctl restart logstash
   ```

    After that, the Logstash should periodically synchronize the Elasticsearch service.

### Helpful Links

- [How To Analyze Managed PostgreSQL Database Statistics Using the Elastic Stack on Ubuntu 18.04](https://www.digitalocean.com/community/tutorials/how-to-analyze-managed-postgresql-database-statistics-using-the-elastic-stack-on-ubuntu-18-04)
- [Insert Into Logstash Select Data from Database](https://www.elastic.co/blog/logstash-jdbc-input-plugin)
