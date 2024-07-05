<img alt="GitHub License" src="https://img.shields.io/github/license/edsol/pg-apify">
<img alt="NPM Version" src="https://img.shields.io/npm/v/pg-apify">
<img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/pg-apify">
<img alt="NPM Downloads" src="https://img.shields.io/npm/dm/pg-apify">

<br/>

![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![openapi initiative](https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white)

# pg-apify

Effortlessly transform your PostgreSQL database into a powerful REST and GraphQL API server with zero coding required

## Features

- **_Zero Coding Required:_** Instantly generate REST and GraphQL endpoints from your PostgreSQL schema without writing a single line of code.
- **_Rapid Setup:_** Get your API server up and running in just a few seconds.
- **_Seamless Integration:_** Easily integrates with your existing PostgreSQL databases, enabling quick and efficient data access.
- **_Customizable Middleware:_** Enhance your API with custom logic using flexible middleware support.
- **_Beautiful API:_** Automatically generate comprehensive API documentation using [Scalar](https://github.com/scalar/scalar) to ensure clear and detailed endpoint information.

## Install and requirements

install pg-apify:

```bash
bun install pg-apify
// or
npm install pg-apify
```

local installation of `postgREST` is also required, follow [official wiki](https://postgrest.org/en/v12/explanations/install.html) to install correctly.

## Usage

### Zero-coding

creates and use `.env` file or passes the configuration directly via parameters and run server

```typescript
import { pgApifyServer, postgraphileOptions, postgrestOptions } from "pg-apify";
import { dev as options } from "./postgraphileOptions";

const postgraphileServerOptions: postgraphileOptions = {
  enabled: true,
  databaseUrl: process.env.DATABASE_URL,
  schema: process.env.PGSCHEMA,
  options: options,
};

const postgrestServerOptions: postgrestOptions = {
  enabled: true,
  enableDocs: true,
};
pgApifyServer(postgraphileServerOptions, postgrestServerOptions);
```

a GraphQL server, RestAPI and OpenAPI documentation will be launched

```bash
🚀 GraphQL server available at http://localhost:5000/graphql
🚀 GraphiQL available at http://localhost:5000/graphiql
📖 API docs is running at http://localhost:3000/docs
🔥 API is running at http://localhost:3000
```

### note

The `postgraphileOptions` file contains the Postgraphile options ([docs](https://www.graphile.org/postgraphile/usage-library/#recommended-options)), see the [example file](example/postgraphileOptions.ts), copy it or create your own custom configuration file.

### Request middleware

intercepts all `GET` requests

```typescript
requestHandler.registerHandler("get", async (params, context, info) => {
  // your code

  return {
    success: false,
    status: 404,
    message: "Custom error message",
  };
});
```

or specific `endpoint`

```typescript
requestHandler.registerRouteHandler(
  "get",
  "foo",
  async (params, context, info) => {
    // your code

    return {
      success: false,
      status: 404,
      message: "Custom error message",
    };
  }
);
```

## Under the hood

### PostGraphile

pg-apify leverages [PostGraphile](https://github.com/graphile/crystal/tree/main/postgraphile/postgraphile), a powerful tool that automatically generates a GraphQL API from your PostgreSQL schema. PostGraphile inspects your database schema, including tables, columns, relationships, and constraints, and creates a fully-functional GraphQL API. This allows you to take advantage of GraphQL's flexibility and efficiency in querying and mutating data.

### PostgREST

In addition to GraphQL, pg-apify also utilizes [PostgREST](https://github.com/PostgREST/postgrest), a standalone web server that turns your PostgreSQL database directly into a RESTful API. PostgREST reads the database schema and creates RESTful endpoints that correspond to your tables and views, enabling CRUD operations with ease.

### Scalar

Using [scalar](https://github.com/scalar/scalar) to generate interactive API documentation from OpenAPI/Swagger documents.

## Do you want to support my work? Buy me an espresso coffee (I'm Italian)

<a href="https://www.buymeacoffee.com/edsol" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
