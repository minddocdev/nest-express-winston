"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpContext = require("express-http-context");
const uuid_1 = require("uuid");
exports.httpContextMiddleware = httpContext.middleware;
exports.requestIdHandler = (_, __, next) => {
    httpContext.set('requestId', uuid_1.v4());
    next();
};
function getRequestIdContext() {
    const requestId = httpContext.get('requestId');
    return requestId;
}
exports.getRequestIdContext = getRequestIdContext;
//# sourceMappingURL=http-context.middleware.js.map