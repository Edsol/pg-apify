import { type Request, type Response, type NextFunction } from 'express';

export type resultResponse = {
    success: true | false,
    status: number,
    message: string,
    data: unknown
}

export type responseContext = {
    req: Request,
    res: Response,
    next: NextFunction,
    graphql?: boolean
}

export const responseHandler = (result: resultResponse, context: responseContext) => {
    if (context.res && typeof context.res.send === 'function') {
        // Caso Express
        if (result.success === false) {
            context.res.status(result.status || 400).send(result.message || 'Error');
        } else {
            context.res.status(result.status || 200).send(result.message || 'Success');
        }
    } else if (context.graphql) {
        // Caso GraphQL
        if (result.success === false) {
            throw new Error(result.message || 'Error');
        }
        return result.data || { success: true };
    } else {
        // Default
        return result;
    }
}
