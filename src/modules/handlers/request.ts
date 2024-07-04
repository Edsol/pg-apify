import { type Request, type Response } from 'express';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';

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
    registerHandler(method: string, callback: CallableFunction) {
        const key = method.toUpperCase();
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
    registerRouteHandler(method: string, controller: string, callback: CallableFunction) {
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

    async handleRequest(reqOrArgs: Request, context: any, info: any, method: string, controller: string): Promise<any> {
        const normalizedParams = this.normalizeParams(reqOrArgs, context);
        let result = { success: true };

        const methodKey = method.toUpperCase();
        const controllerKey = controller ? `${methodKey}:${controller}` : null;

        const middlewares = [
            ...this.middlewares,
            ...(controllerKey ? (this.controllerMiddlewares[controllerKey] || []) : []),
            ...(this.methodMiddlewares[methodKey] || [])
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
    async handlePostRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
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
    async handlePutRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
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
    async handlePatchRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
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
    async handleDeleteRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
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
    async handleOptionsRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
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
    async handleHeadRequest(reqOrArgs: Request, context: any, info: any, controller: string) {
        return await this.handleRequest(reqOrArgs, context, info, 'HEAD', controller);
    }


    hasCallback(method: string, controller = null) {
        const methodKey = method.toUpperCase();
        const controllerKey = `${methodKey}:${controller}`;

        return !!(this.methodMiddlewares[methodKey] || this.controllerMiddlewares[controllerKey]);
    }

    getMethodsAndControllersHavingCallbacks() {
        const methodsAndControllers: KeySetInterface = {};

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