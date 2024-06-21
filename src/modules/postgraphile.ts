import { createServer } from 'http';
import postgraphile, { type PostGraphileOptions } from "postgraphile";
import { mutationHandler } from './plugins/mutationHandler';
import { queryHandler } from './plugins/queryHandler';

export type postgraphileOptions = {
    enabled: true | false,
    options: PostGraphileOptions,
    port: number,
    schema: string,
    databaseUrl: string,
    loadCustomMutationHandler: true | false,
    loadCustomQueryHandler: true | false,
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

    const postgraphileServer = postgraphile(args.databaseUrl, args.schema, args.options);

    const server = createServer(postgraphileServer)
        .listen(port, () => {
            const address = server.address();
            if (typeof address !== 'string') {
                const href = `http://localhost:${address.port}${options.graphiqlRoute || '/graphiql'}`;
                console.log(`🚀 PostGraphiQL available at ${href}`);
            } else {
                console.log(`🚀 PostGraphile listening on ${address}`);
            }
        });
}