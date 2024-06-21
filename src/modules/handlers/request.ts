export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

class RequestHandler {
    middlewares: CallableFunction[];
    controllerMiddlewares;
    methodMiddlewares;
    methodCallbacks: Record<HttpMethod, CallableFunction[]>;

    constructor() {
        this.middlewares = [];
        this.controllerMiddlewares = {};
        this.methodMiddlewares = {};
        this.methodCallbacks = {
            GET: [],
            POST: [],
            PUT: [],
            PATCH: [],
            DELETE: [],
            OPTIONS: [],
            HEAD: [],
        };
    }

    /**
     *
     *
     * @param {*} middleware
     * @memberof RequestHandler
     */
    use(middleware) {
        this.middlewares.push(middleware);
    }

    useForMethod(method, callback) {
        const key = method.toUpperCase();
        if (!this.methodMiddlewares[key]) {
            this.methodMiddlewares[key] = [];
        }
        this.methodMiddlewares[key].push(callback);
    }

    useForMethodAndController(method, controller, callback) {
        const key = `${method.toUpperCase()}:${controller}`;
        if (!this.controllerMiddlewares[key]) {
            this.controllerMiddlewares[key] = [];
        }

        this.controllerMiddlewares[key].push(callback);
    }



    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @return {*} 
     * @memberof RequestHandler
     */
    normalizeParams(reqOrArgs, context) {
        if (typeof reqOrArgs === 'object' && reqOrArgs.body !== undefined) {
            // Express case
            return {
                method: reqOrArgs.method,
                body: reqOrArgs.body,
                params: reqOrArgs.params,
                query: reqOrArgs.query,
                headers: reqOrArgs.headers,
            };
        }
        // GraphQL case
        return {
            method: context.method || 'MUTATION',
            body: reqOrArgs,
            params: {},
            query: {},
            headers: context.headers || {},
        };

    }

    async handleRequest(reqOrArgs, context, info, method, controller) {
        const normalizedParams = this.normalizeParams(reqOrArgs, context);
        let result = { success: true };

        console.log('handleRequest', method, controller);

        const methodKey = method.toUpperCase();
        const controllerKey = controller ? `${methodKey}:${controller}` : null;

        const middlewares = [
            ...this.middlewares,
            ...(controllerKey ? (this.controllerMiddlewares[controllerKey] || []) : []),
            ...(this.methodMiddlewares[methodKey] || [])
        ];

        for (const middleware of middlewares) {
            result = await middleware(normalizedParams, context, info, method);
            if (result && result.success === false) {
                return result;
            }
        }
        return result;
    }


    async handleGetRequest(reqOrArgs, context, info, controller) {
        console.log('handleGetRequest');
        return this.handleRequest(reqOrArgs, context, info, 'GET', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePostRequest(reqOrArgs, context, info, controller) {
        return await this.handleRequest(reqOrArgs, context, info, 'POST', controller);
    }

    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePutRequest(reqOrArgs, context, info, controller) {
        return await this.handleRequest(reqOrArgs, context, info, 'PUT', controller);
    }


    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePatchRequest(reqOrArgs, context, info, controller) {
        return await this.handleRequest(reqOrArgs, context, info, 'PATCH', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handleDeleteRequest(reqOrArgs, context, info, controller) {
        return await this.handleRequest(reqOrArgs, context, info, 'DELETE', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @return {*} 
     * @memberof RequestHandler
     */
    async handleOptionsRequest(reqOrArgs, context, info, controllero) {
        return await this.handleRequest(reqOrArgs, context, info, 'OPTIONS', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @return {*} 
     * @memberof RequestHandler
     */
    async handleHeadRequest(reqOrArgs, context, info, controller) {
        return await this.handleRequest(reqOrArgs, context, info, 'HEAD', controller);
    }


    hasCallback(method, controller = null) {
        const methodKey = method.toUpperCase();
        const controllerKey = controller ? `${methodKey}:${controller}` : null;

        console.log("hasCallback", method, controller, methodKey, this.methodMiddlewares);
        return !!(this.methodMiddlewares[methodKey] || this.controllerMiddlewares[controllerKey]);
    }

    getMethodsAndControllersHavingCallbacks() {
        const methodsAndControllers = {};

        // Aggiungi i controller associati alle callback di metodo
        for (const key in this.controllerMiddlewares) {
            const [method, controller] = key.split(':');
            if (!methodsAndControllers[method]) {
                methodsAndControllers[method] = new Set();
            }
            methodsAndControllers[method].add(controller);
        }

        // Aggiungi i metodi senza controller specificato
        for (const method in this.methodMiddlewares) {
            if (!methodsAndControllers[method]) {
                methodsAndControllers[method] = new Set();
            }
        }

        return methodsAndControllers;
    }
}

export const requestHandler = new RequestHandler();

export const methodHandlers = {
    GET: requestHandler.handleGetRequest.bind(requestHandler),
    POST: requestHandler.handlePostRequest.bind(requestHandler),
    PUT: requestHandler.handlePutRequest.bind(requestHandler),
    PATCH: requestHandler.handlePatchRequest.bind(requestHandler),
    DELETE: requestHandler.handleDeleteRequest.bind(requestHandler),
    OPTIONS: requestHandler.handleOptionsRequest.bind(requestHandler),
    HEAD: requestHandler.handleHeadRequest.bind(requestHandler),
};