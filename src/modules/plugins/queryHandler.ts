const { requestHandler } = require("../handlers/request");
const { responseHandler } = require("../handlers/response");
export const queryHandler = (builder) => {
    builder.hook('GraphQLObjectType:fields', (fields, build, context) => {
        const { scope: { isRootQuery }, Self } = context;

        if (!isRootQuery) {
            return fields;
        }

        const newFields = {};
        const methodsAndControllers = requestHandler.getMethodsAndControllersHavingCallbacks();

        for (const [fieldName, field] of Object.entries(fields)) {
            const method = 'GET';
            const controllers = methodsAndControllers[method] || new Set();
            const controller = [...controllers].find(controller => fieldName.includes(controller));

            newFields[fieldName] = {
                ...field,
                resolve: async (parent, args, context, info) => {
                    context.graphql = true;

                    if (controller) {
                        const result = await requestHandler.handleRequest(args, context, info, method, controller);
                        return responseHandler(result, context);
                    }

                    // Se non ci sono controller corrispondenti, esegui la query originale
                    return field.resolve(parent, args, context, info);
                },
            };
        }

        return newFields;
    });
};