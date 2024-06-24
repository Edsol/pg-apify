import { createServer } from 'http';
import postgraphile, { type PostGraphileOptions } from "postgraphile";
import { mutationHandler } from './plugins/mutationHandler';
import { queryHandler } from './plugins/queryHandler';

/**
 * @property {bool} enabled - asdasd
 */
export type postgraphileOptions = {

    /**
     * Flag to enable or disable PostGraphile.
     */
    enabled: true | false,

    /**
     * Configuration options for PostGraphile.
     */
    options: PostGraphileOptions,

    /**
     * The port number on which the server will run.
     */
    port: number,

    /**
     * The schema to be used by PostGraphile.
     */
    schema: string,

    /**
     * The database connection URL.
     */
    databaseUrl: string,

    /**
     * Flag to load a custom mutation handler.
     */
    loadCustomMutationHandler: true | false,

    /**
     * Flag to load a custom query handler.
     */
    loadCustomQueryHandler: true | false,

    /**
     * Optional flag to enable or disable metrics.
     */
    metrics?: true | false
};

export const runPostgrahileServer = async (args: postgraphileOptions) => {
    const options = args.options;
    let port = args.port;

    if (!options) {
        throw "No options was found";
    }
    if (!port) {
        port = 5000;
    }

    if (args.loadCustomMutationHandler || false) {
        options.appendPlugins.push(mutationHandler);
    }
    if (args.loadCustomQueryHandler || false) {
        options.appendPlugins.push(queryHandler);
    }

    const postgraphileServer = postgraphile(args.databaseUrl, args.schema, options);

    const server = createServer(postgraphileServer)
        .listen(port, () => {

            const address = server.address();
            const baseAddress = address.address === '::' ? 'localhost' : address.address;
            const baseUrl = `http://${baseAddress}:${address.port}`;

            console.log(`🚀 GraphQL server available at ${baseUrl}${options.graphqlRoute || '/graphql'}`);

            if (options.graphiql) {
                const href = `${baseUrl}${options.graphiqlRoute || '/graphiql'}`;
                console.log(`🚀 GraphiQL available at ${href}`);
            }

        });
}