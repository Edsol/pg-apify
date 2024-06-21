const { requestHandler } = require("../handlers/request");
const { responseHandler } = require("../handlers/response");

const methodPrefixToMethod = {
    update: 'POST',
    create: 'PUT',
    delete: 'DELETE',
};

const methodHandlers = {
    GET: requestHandler.handleGetRequest.bind(requestHandler),
    PUT: requestHandler.handlePutRequest.bind(requestHandler),
    POST: requestHandler.handlePostRequest.bind(requestHandler),
    DELETE: requestHandler.handleDeleteRequest.bind(requestHandler),
};

export const mutationHandler = (builder) => {
    builder.hook('GraphQLObjectType:fields', (fields, build, context) => {
        const { scope: { isRootMutation }, Self } = context;

        if (!isRootMutation) {
            return fields;
        }

        const newFields = {};
        for (const [fieldName, field] of Object.entries(fields)) {

            const methodPrefix = Object.keys(methodPrefixToMethod).find(prefix => fieldName.startsWith(prefix));
            const controller = fieldName.replace(/^(create|update|delete)/, '').toLowerCase();
            const method = methodPrefixToMethod[methodPrefix];

            const methodsAndControllers = requestHandler.getMethodsAndControllersHavingCallbacks();

            newFields[fieldName] = {
                ...field, resolve: async (parent, args, context, info) => {
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
    });
};