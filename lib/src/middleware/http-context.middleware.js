"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpContext = require("express-http-context");
const uuidv1 = require("uuid/v1");
exports.httpContextMiddleware = httpContext.middleware;
exports.requestIdHandler = (_, __, next) => {
    httpContext.set('requestId', uuidv1());
    next();
};
function getRequestIdContext() {
    const requestId = httpContext.get('requestId');
    return requestId;
}
exports.getRequestIdContext = getRequestIdContext;
//# sourceMappingURL=http-context.middleware.js.map