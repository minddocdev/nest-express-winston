"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLogger = void 0;
class WinstonLogger {
    constructor(logger) {
        this.logger = logger;
    }
    log(message, context) {
        return this.logger.info(message, { context });
    }
    error(message, trace, context) {
        return this.logger.error(message, { trace, context });
    }
    warn(message, context) {
        return this.logger.warn(message, { context });
    }
    debug(message, context) {
        return this.logger.debug(message, { context });
    }
    verbose(message, context) {
        return this.logger.verbose(message, { context });
    }
}
exports.WinstonLogger = WinstonLogger;
//# sourceMappingURL=winston.logger.js.map