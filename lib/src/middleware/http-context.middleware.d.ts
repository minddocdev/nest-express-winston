import { NextFunction, Request, Response } from 'express';
import * as httpContext from 'express-http-context';
export declare const httpContextMiddleware: typeof httpContext.middleware;
export declare const requestIdHandler: (_: Request, __: Response, next: NextFunction) => void;
export declare function getRequestIdContext(): string | undefined;
