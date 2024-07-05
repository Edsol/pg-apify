import { type Request, type Response } from 'express';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

export const AllRequestField = 'all';

interface KeyArrayInterface {
    [key: string]: Array<unknown>;
}
interface KeySetInterface {
    [key: string]: Set<unknown>;
}

class RequestHandler {
    middlewares: Array<CallableFunction>;
    controllerMiddlewares: KeyArrayInterface;
    methodMiddlewares: KeyArrayInterface;
    methodCallbacks: Record<HttpMethod, CallableFunction[]>;

    constructor() {
        this.middlewares = [];
        this.controllerMiddlewares = {};
        this.methodMiddlewares = {};
        this.methodCallbacks = {
            get: [],
            post: [],
            put: [],
            patch: [],
            delete: [],
            options: [],
            head: [],
        };
    }

    /**
     *
     *
     * @param {*} middleware
     * @memberof RequestHandler
     */
    use(middleware: CallableFunction) {
        this.middlewares.push(middleware);
    }

    /**
     *
     *
     * @param {string} method
     * @param {CallableFunction} callback
     * @memberof RequestHandler
     */
    registerHandler(method: HttpMethod, callback: CallableFunction) {
        // force lowercase for HTTP method
        const key = method.toLowerCase();
        if (!this.methodMiddlewares[key]) {
            this.methodMiddlewares[key] = [];
        }
        this.methodMiddlewares[key].push(callback);
    }
    /**
     *
     *
     * @param {string} method
     * @param {string} controller
     * @param {CallableFunction} callback
     * @memberof RequestHandler
     */
    registerRouteHandler(method: HttpMethod, controller: string, callback: CallableFunction) {
        const key = `${method.toLowerCase()}:${controller}`;
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
    normalizeParams(reqOrArgs: Request, context: any) {
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

    async handleRequest(reqOrArgs: Request, context: any, info: any, method: HttpMethod, controller: string): Promise<any> {
        const normalizedParams = this.normalizeParams(reqOrArgs, context);
        let result = { success: true };

        const controllerKey = controller ? `${method}:${controller}` : null;
        const middlewares = [
            ...this.middlewares,
            ...(controllerKey ? (this.controllerMiddlewares[controllerKey] || []) : []),
            ...(this.methodMiddlewares[method] || [])
        ];

        for (const middleware of middlewares) {
            if (typeof middleware === 'function') {
                result = await middleware(normalizedParams, context, info, method);
                if (result && result.success === false) {
                    return result;
                }
            }

        }
        return result;
    }

    async handleGetRequest(reqOrArgs: Request, context: any, info: any, controller: string): Promise<any> {
        return this.handleRequest(reqOrArgs, context, info, 'get', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePostRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'post', controller);
    }

    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePutRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'put', controller);
    }


    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handlePatchRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'patch', controller);
    }
    /**
     *
     *
     * @param {*} reqOrArgs
     * @param {*} context
     * @param {*} info
     * @memberof RequestHandler
     */
    async handleDeleteRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'delete', controller);
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
    async handleOptionsRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'options', controller);
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
    async handleHeadRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'head', controller);
    }


    hasCallback(method: string, controller = null) {
        const methodKey = method;
        const controllerKey = `${methodKey}:${controller}`;

        return !!(this.methodMiddlewares[methodKey] || this.controllerMiddlewares[controllerKey]);
    }

    getMethodsAndControllersHavingCallbacks() {
        const methodsAndControllers: KeySetInterface = {};

        // Add controllers associated with method callbacks
        for (const key in this.controllerMiddlewares) {
            const [method, controller] = key.split(':');
            if (!methodsAndControllers[method]) {
                methodsAndControllers[method] = new Set();
            }
            methodsAndControllers[method].add(controller);
        }

        // Add methods without specified controller
        for (const method in this.methodMiddlewares) {
            if (!methodsAndControllers[method]) {
                methodsAndControllers[method] = new Set();
            }
            methodsAndControllers[method].add(AllRequestField);
        }

        return methodsAndControllers;
    }
}

export const requestHandler = new RequestHandler();

// export const methodHandlers: KeyFunctionInterface = {
export const methodHandlers: Record<HttpMethod, (req: Request, context: any, info: any, controller?: any) => Promise<any>> = {
    get: requestHandler.handleGetRequest.bind(requestHandler),
    post: requestHandler.handlePostRequest.bind(requestHandler),
    put: requestHandler.handlePutRequest.bind(requestHandler),
    patch: requestHandler.handlePatchRequest.bind(requestHandler),
    delete: requestHandler.handleDeleteRequest.bind(requestHandler),
    options: requestHandler.handleOptionsRequest.bind(requestHandler),
    head: requestHandler.handleHeadRequest.bind(requestHandler),
};