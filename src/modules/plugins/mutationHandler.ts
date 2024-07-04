import type { SchemaBuilder, Build, Context } from "postgraphile";

const { requestHandler } = require("../handlers/request");
const { responseHandler } = require("../handlers/response");

interface stringKeyType {
    [key: string]: string;
}

const methodPrefixToMethod: stringKeyType = {
    "update": 'POST',
    "create": 'PUT',
    "delete": 'DELETE',
};

// const methodHandlers = {
//     GET: requestHandler.handleGetRequest.bind(requestHandler),
//     PUT: requestHandler.handlePutRequest.bind(requestHandler),
//     POST: requestHandler.handlePostRequest.bind(requestHandler),
//     DELETE: requestHandler.handleDeleteRequest.bind(requestHandler),
// };

export const mutationHandler = (builder: any) => {
    const callback = (fields: object, build: Build, context: Context<object>) => {
        const { scope: { isRootMutation }, Self } = context;

        if (!isRootMutation) {
            return fields;
        }

        const newFields: stringKeyType = {};
        for (const [fieldName, field] of Object.entries(fields)) {

            const methodPrefix = Object.keys(methodPrefixToMethod).find(prefix => fieldName.startsWith(prefix));
            const controller = fieldName.replace(/^(create|update|delete)/, '').toLowerCase();

            if (methodPrefix === undefined) {
                return;
            }
            const method = methodPrefixToMethod[methodPrefix];

            const methodsAndControllers = requestHandler.getMethodsAndControllersHavingCallbacks();

            newFields[fieldName] = {
                ...field, resolve: async (parent: object, args: object, context: { graphql: boolean }, info: object) => {
                    context.graphql = true;
                    const controllers = methodsAndControllers[method];

                    if (!controllers) {
                        return field.resolve(parent, args, context, info);
                    }

                    const result = await requestHandler.handleRequest(args, context, info, method, controller);
                    return responseHandler(result, context);
                },
            };
        }

        return newFields;
    };

    builder.hook('GraphQLObjectType:fields', callback);
};