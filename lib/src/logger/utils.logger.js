"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const expressWinston = require("express-winston");
const fs = require("fs");
const winston_1 = require("winston");
const config_1 = require("../config");
const http_context_middleware_1 = require("../middleware/http-context.middleware");
const winston_logger_1 = require("./winston.logger");
const level = config_1.env.LOG_LEVEL;
const stderrLevels = ['error'];
const injectMeta = winston_1.format(info => {
    info.requestId = http_context_middleware_1.getRequestIdContext();
    info.environment = config_1.env.ENVIRONMENT;
    info.version = config_1.env.VERSION;
    return info;
});
function serializeError(error) {
    const { stack, message, name } = error;
    const serializedStack = !!stack ? stack.split('/n') : null;
    return Object.assign(Object.assign({}, error), { message,
        name, stack: serializedStack });
}
const errorsFormat = winston_1.format(info => {
    if (info.level === 'error' && info.error) {
        info.error = serializeError(info.error);
    }
    return info;
});
function formatLog(info) {
    const { environment, level, label, timestamp, message, meta, splat } = info, rest = __rest(info, ["environment", "level", "label", "timestamp", "message", "meta", "splat"]);
    return `[${environment}] ${level}: [${label}] ${message} ${JSON.stringify(rest)}`;
}
function createNestWinstonLogger(label) {
    const logTransporters = [
        new winston_1.transports.Stream({
            stream: fs.createWriteStream(process.platform === 'win32' ? '\\\\.\\NUL' : '/dev/null'),
            silent: true,
        }),
    ];
    const consoleTransport = new winston_1.transports.Console({ stderrLevels });
    if (config_1.env.ENVIRONMENT === 'development') {
        consoleTransport.format = winston_1.format.combine(winston_1.format.colorize(), winston_1.format.printf(info => formatLog(info)));
        logTransporters.push(consoleTransport);
    }
    else if (config_1.isKubernetesEnv) {
        consoleTransport.format = winston_1.format.combine(winston_1.format.timestamp(), winston_1.format.logstash());
        logTransporters.push(consoleTransport);
    }
    return new winston_logger_1.WinstonLogger(winston_1.createLogger({
        level,
        levels: winston_1.config.npm.levels,
        format: winston_1.format.combine(injectMeta(), errorsFormat(), winston_1.format.label({ label })),
        transports: logTransporters,
    }));
}
exports.createNestWinstonLogger = createNestWinstonLogger;
function sanitizeHeaders(req, propName) {
    if (propName === 'headers') {
        if ('authorization' in req.headers)
            req.headers.authorization = 'Bearer [REDACTED]';
        if ('if-none-match' in req.headers)
            req.headers['if-none-match'] = 'EXCLUDED';
    }
    return req[propName];
}
function createExpressWinstonHandler(logger) {
    return expressWinston.logger({
        winstonInstance: logger,
        meta: true,
        metaField: 'express',
        msg: '{{req.method}} {{req.url}}',
        expressFormat: false,
        colorize: config_1.env.ENVIRONMENT === 'development',
        requestFilter: sanitizeHeaders,
        ignoreRoute: () => false,
    });
}
exports.createExpressWinstonHandler = createExpressWinstonHandler;
//# sourceMappingURL=utils.logger.js.map