import DatabaseConnection from './modules/databaseConnection';
import { postgraphileOptions, runPostgrahileServer } from './modules/postgraphile';
import { runPostgrestServer, postgrestOptions } from './modules/postgrest';

import { requestHandler } from './modules/handlers/request';

const POSTGRAPHILE_RUNTIME_MESSAGE = "Postgrahile server runtime";
const POSTGREST_RUNTIME_MESSAGE = "Postgrest server runtime";


const databaseConnection = new DatabaseConnection();

/**
 *
 *
 * @param {postgraphileOptions} postgraphileOptions
 * @param {postgrestOptions} postgrestOptions
 */
const runServers = async (postgraphileOptions: postgraphileOptions, postgrestOptions: postgrestOptions) => {
    runPostgrahile(postgraphileOptions);
    runPostgrest(postgrestOptions);
}

/**
 *
 *
 * @param {postgraphileOptions} postgraphileOptions
 * @return {*} 
 */
function runPostgrahile(postgraphileOptions: postgraphileOptions) {
    if (!postgraphileOptions.enabled) {
        return false;
    }

    if (postgraphileOptions.metrics) {
        console.time(POSTGRAPHILE_RUNTIME_MESSAGE);
    }

    runPostgrahileServer(postgraphileOptions).then((result) => {
        console.timeEnd(POSTGRAPHILE_RUNTIME_MESSAGE);
    });
}

/**
 *
 *
 * @param {postgrestOptions} postgrestOptions
 * @return {*} 
 */
function runPostgrest(postgrestOptions: postgrestOptions) {
    if (!postgrestOptions.enabled) {
        return false;
    }
    if (postgrestOptions.metrics) {
        console.time(POSTGREST_RUNTIME_MESSAGE);
    }
    runPostgrestServer(postgrestOptions).then(() => {
        console.timeEnd(POSTGREST_RUNTIME_MESSAGE);
    });
}

export { runServers, databaseConnection, requestHandler, type postgraphileOptions, type postgrestOptions };