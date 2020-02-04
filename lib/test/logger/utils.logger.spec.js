"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const expressWinston = require("express-winston");
const fs = require("fs");
const winston = require("winston");
const src_1 = require("../../src");
const config = require("../../src/config");
jest.mock('winston', () => ({
    createLogger: jest.fn(),
    config: {
        npm: {
            levels: { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6 },
        },
    },
    format: jest.fn(() => jest.fn(() => 'transformExpressMeta')),
    transports: {
        Console: jest.fn().mockImplementation(() => ({ name: 'Console' })),
        Stream: jest.fn().mockImplementation(() => ({ name: 'Stream' })),
    },
}));
jest.mock('express-winston', () => ({
    logger: jest.fn(),
}));
jest.mock('../../src/config', () => ({
    env: {
        LOG_LEVEL: 'debug',
        ENVIRONMENT: 'unit',
    },
    isKubernetesEnv: true,
}));
describe('utils logger', () => {
    const infoStub = {
        level: 'info',
        label: 'app',
        environment: 'fakeEnvironment',
        message: 'message',
        requestId: 'requestId',
        express: { req: {} },
        user: 'userUuid',
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('create nest winston logger', () => {
        const label = 'unittest';
        const stubFormat = (infoStub) => ({
            combine: jest.fn((...args) => args),
            colorize: jest.fn(() => 'colorize'),
            label: jest.fn(label => label),
            logstash: jest.fn(() => 'logstash'),
            printf: jest.fn(templateFunction => templateFunction(infoStub)),
            timestamp: jest.fn(() => 'timestamp'),
        });
        test('development', () => {
            config.env.ENVIRONMENT = 'development';
            config.isKubernetesEnv = false;
            winston.format = stubFormat(infoStub);
            src_1.createNestWinstonLogger(label);
            const expectedPrintfFormat = common_tags_1.oneLineTrim `
        [fakeEnvironment] info: [app] message {\"requestId\":\"requestId\",\"express\"
        :{\"req\":{}},\"user\":\"userUuid\"}
      `;
            expect(winston.createLogger).toBeCalledWith({
                level: config.env.LOG_LEVEL,
                levels: winston.config.npm.levels,
                format: ['transformExpressMeta', 'transformExpressMeta', { label: 'unittest' }],
                transports: [
                    { name: 'Stream' },
                    { name: 'Console', format: ['colorize', expectedPrintfFormat] },
                ],
            });
            expect(winston.format.combine).toHaveBeenCalledTimes(2);
            expect(winston.format.label).toBeCalledWith({ label });
            expect(winston.format.colorize).toBeCalled();
            expect(winston.format.printf).toBeCalledWith(expect.any(Function));
            expect(winston.format.timestamp).not.toBeCalled();
            expect(winston.format.logstash).not.toBeCalled();
        });
        test('production', () => {
            config.env.ENVIRONMENT = 'production';
            config.isKubernetesEnv = true;
            winston.format = stubFormat(infoStub);
            src_1.createNestWinstonLogger(label);
            expect(winston.createLogger).toBeCalledWith({
                level: config.env.LOG_LEVEL,
                levels: winston.config.npm.levels,
                format: ['transformExpressMeta', 'transformExpressMeta', { label: 'unittest' }],
                transports: [{ name: 'Stream' }, { name: 'Console', format: ['timestamp', 'logstash'] }],
            });
            expect(winston.format.combine).toHaveBeenCalledTimes(2);
            expect(winston.format.label).toBeCalledWith({ label });
            expect(winston.format.colorize).not.toBeCalled();
            expect(winston.format.timestamp).toBeCalled();
            expect(winston.format.logstash).toBeCalled();
        });
        describe('stream transport', () => {
            let originalPlatform;
            beforeEach(() => {
                originalPlatform = process.platform;
            });
            afterEach(() => {
                Object.defineProperty(process, 'platform', { value: originalPlatform });
            });
            test('to NUL in windows', () => {
                jest.spyOn(fs, 'createWriteStream').mockImplementationOnce(jest.fn());
                Object.defineProperty(process, 'platform', { value: 'win32' });
                src_1.createNestWinstonLogger(label);
                expect(fs.createWriteStream).toBeCalledWith('\\\\.\\NUL');
            });
            test('to /dev/null in other platforms', () => {
                ['darwin', 'freebsd', 'linux', 'sunos'].forEach(platform => {
                    jest.spyOn(fs, 'createWriteStream').mockImplementationOnce(jest.fn());
                    Object.defineProperty(process, 'platform', { value: platform });
                    src_1.createNestWinstonLogger(label);
                    expect(fs.createWriteStream).toBeCalledWith('/dev/null');
                });
            });
        });
    });
    test('create express winston handler', () => {
        const loggerStub = {};
        src_1.createExpressWinstonHandler(loggerStub);
        const calledParam = expressWinston.logger.mock.calls[0][0];
        const { ignoreRoute, requestFilter } = calledParam;
        expect(calledParam).toMatchObject({
            colorize: config.env.ENVIRONMENT === 'development',
            expressFormat: false,
            ignoreRoute: expect.any(Function),
            requestFilter: expect.anything(),
            meta: true,
            metaField: 'express',
            msg: '{{req.method}} {{req.url}}',
            winstonInstance: loggerStub,
        });
        expect(ignoreRoute()).toBe(false);
        const req = {
            headers: {
                authorization: 'Bearer MYSECRETJWTTOKEN',
                'if-none-match': 'W/"2da-0kj/eLumj9c7RIVAqQqLv+KH0h4"',
            },
            fake: { param: 'isFake' },
        };
        expect(requestFilter(req, 'headers')).toEqual({
            authorization: 'Bearer [REDACTED]',
            'if-none-match': 'EXCLUDED',
        });
        expect(requestFilter(req, 'fake')).toEqual(req.fake);
        expect(requestFilter({ headers: { test: '1' } }, 'headers')).toEqual({ test: '1' });
    });
});
//# sourceMappingURL=utils.logger.spec.js.map