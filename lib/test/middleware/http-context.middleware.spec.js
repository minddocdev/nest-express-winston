"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const httpContext = require("express-http-context");
const uuidv1 = require("uuid/v1");
const src_1 = require("../../src/");
const uuidv1Mock = uuidv1;
jest.mock('express-http-context', () => ({
    set: jest.fn(),
    get: jest.fn(),
}));
jest.mock('uuid/v1');
describe('HttpContext Middleware', () => {
    const requestId = '75e10ee1-6c92-4c58-b639-8a5875da1820';
    test('requestId handler', () => {
        uuidv1Mock.mockImplementation(jest.fn(() => requestId));
        const next = jest.fn();
        src_1.requestIdHandler({}, {}, next);
        expect(httpContext.set).toBeCalledWith('requestId', requestId);
        expect(next).toBeCalledWith();
    });
    test('get request id context', () => {
        httpContext.get = jest.fn(() => requestId);
        expect(requestId).toBe(src_1.getRequestIdContext());
        expect(httpContext.get).toBeCalledWith('requestId');
    });
});
//# sourceMappingURL=http-context.middleware.spec.js.map