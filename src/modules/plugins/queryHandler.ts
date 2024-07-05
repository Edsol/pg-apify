import type { SchemaBuilder, Build, Context } from "postgraphile";
import { AllRequestField, type HttpMethod } from "../handlers/request";

const { requestHandler } = require("../handlers/request");
const { responseHandler } = require("../handlers/response");

interface FieldType {
    resolve: (parent: object, args: object, context: { graphql: boolean }, info: object) => any;
    // add other possible properties of field objects here
}

interface fieldsType {
    [key: string]: object;
}

export const queryHandler = (builder: any) => {
    const callback = (fields: FieldType, build: Build, context: Context<object>) => {

        const { scope: { isRootQuery }, Self } = context;

        if (!isRootQuery) {
            return fields;
        }

        const newFields: fieldsType = {};
        const methodsAndControllers = requestHandler.getMethodsAndControllersHavingCallbacks();

        for (const [fieldName, field] of Object.entries(fields)) {
            const method: HttpMethod = 'get';
            const controllers = methodsAndControllers[method] || new Set();
            const controller = [...controllers].find(controller => fieldName.includes(controller) || controller === AllRequestField);

            newFields[fieldName] = {
                ...field,
                resolve: async (parent: object, args: object, context: { graphql: boolean }, info: object) => {
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
    };

    builder.hook('GraphQLObjectType:fields', callback);
};