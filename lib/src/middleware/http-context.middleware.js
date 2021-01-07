"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestIdContext = exports.requestIdHandler = exports.httpContextMiddleware = void 0;
const httpContext = require("express-http-context");
const uuid_1 = require("uuid");
exports.httpContextMiddleware = httpContext.middleware;
const requestIdHandler = (_, __, next) => {
    httpContext.set('requestId', uuid_1.v4());
    next();
};
exports.requestIdHandler = requestIdHandler;
function getRequestIdContext() {
    const requestId = httpContext.get('requestId');
    return requestId;
}
exports.getRequestIdContext = getRequestIdContext;
//# sourceMappingURL=http-context.middleware.js.map