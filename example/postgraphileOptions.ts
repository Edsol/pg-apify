import { PostGraphileOptions } from "postgraphile";

// API DOCS: https://www.graphile.org/postgraphile/usage-library/#api-postgraphilepgconfig-schemaname-options
const dev: PostGraphileOptions = {
    subscriptions: false,
    watchPg: true,
    dynamicJson: false,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: "json",
    extendedErrors: [
        "hint",
        "detail",
        "errcode"
    ],
    appendPlugins: [
        require("postgraphile-plugin-connection-filter"),
        require("@graphile-contrib/pg-simplify-inflector"),
    ],
    // exportGqlSchemaPath: "schema.graphql",
    graphiql: true,
    enhanceGraphiql: true,
    allowExplain(req) {
        // TODO: customise condition!
        return true;
    },
    enableQueryBatching: true,
    legacyRelations: "omit",
    pgSettings: async req => (
        {
            /* TODO */
        }
    ),
    simpleCollections: "only",
    graphileBuildOptions: {
        pgOmitListSuffix: true,
        pgStrictFunctions: true // https://www.graphile.org/postgraphile/custom-mutations/#example
    },
    disableDefaultMutations: false
}

const prod: PostGraphileOptions = {
    subscriptions: false,
    watchPg: true,
    dynamicJson: false,
    setofFunctionsContainNulls: false,
    ignoreRBAC: false,
    showErrorStack: "json",
    extendedErrors: ["hint", "detail", "errcode"],
    appendPlugins: [
        require("postgraphile-plugin-connection-filter"),
        require("@graphile-contrib/pg-simplify-inflector"),
    ],
    // exportGqlSchemaPath: "schema.graphql",
    graphiql: true,
    enhanceGraphiql: true,
    allowExplain(req) {
        // TODO: customise condition!
        return true;
    },
    enableQueryBatching: true,
    legacyRelations: "omit",
    pgSettings: async req => (
        {
            /* TODO */
        }
    ),
    simpleCollections: "only",
    graphileBuildOptions: {
        pgOmitListSuffix: true,
        pgStrictFunctions: true // https://www.graphile.org/postgraphile/custom-mutations/#example
    },
    disableDefaultMutations: false
}

export { dev, prod };