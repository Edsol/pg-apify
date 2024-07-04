import { pgApifyServer, databaseConnection, requestHandler, type postgraphileOptions, type postgrestOptions } from '../src/index';
import { dev as options } from "./postgraphileOptions";

// requestHandler.use(async (params, context, info) => {
//     return {
//         success: false,
//         status: 303,
//         message: 'Callback asd',
//     };
// });
requestHandler.registerHandler('GET', async (params, context, info) => {
    return {
        success: false,
        status: 303,
        message: 'Callback error',
    };
});

// requestHandler.registerRouteHandler('PUT', 'type', async (params, context, info) => {
//     console.log("Handling GET request:", params.method);

//     return {
//         success: false,
//         status: 303,
//         message: 'Callback error',
//     };
// });
// requestHandler.registerRouteHandler('GET', 'state', async (params, context, info) => {
//     console.log("Handling GET request:", params.method);

//     return {
//         success: false,
//         status: 303,
//         message: 'Callback error',
//     };
// });

// requestHandler.registerRouteHandler('GET', 'type', async (params, context, info) => {
//     return {
//         success: false,
//         status: 303,
//         message: 'Callback error',
//     };
// });

const postgraphileServerOptions: postgraphileOptions = {
    enabled: true,
    port: process.env.POSTGRAPHILE_PORT || 5000,
    databaseUrl: process.env.DATABASE_URL,
    schema: process.env.PGSCHEMA,
    options: options,
    loadCustomMutationHandler: true,
    loadCustomQueryHandler: true,
    metrics: false
}

const postgrestServerOptions: postgrestOptions = {
    enabled: true,
    enableDocs: true,
    verboseMode: false,
    port: process.env.PROXY_SERVER_PORT || 3000,
    metrics: false
};
pgApifyServer(postgraphileServerOptions, postgrestServerOptions);

// databaseConnection.set({
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     user: process.env.PGUSER,
//     pass: process.env.PGPASSWORD,
//     database: process.env.PGDATABASE,
//     DATABASE_URL: process.env.DATABASE_URL
// });

// // check the database connection before starting services
// databaseConnection.connect()
//     .then((res) => {
//         runServers(postgraphileServerOptions, postgrestServerOptions);
//     })
//     .catch(error => {
//         throw new Error("DB connection failed");

//     })