"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const src_1 = require("../../src");
describe('Winston Logger', () => {
    const logger = winston_1.createLogger({ transports: new winston_1.transports.Console({ level: 'trace' }) });
    const winstonLogger = new src_1.WinstonLogger(logger);
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        jest.clearAllMocks();
    }));
    test('should proxy log correctly', () => {
        jest.spyOn(logger, 'log');
        winstonLogger.log('log message');
        expect(logger.log).toBeCalledWith('info', 'log message', { context: undefined });
    });
    test('should proxy error correctly', () => {
        jest.spyOn(logger, 'error');
        winstonLogger.error('error message');
        expect(logger.error).toBeCalledWith('error message', { context: undefined, trace: undefined });
    });
    test('should proxy warn correctly', () => {
        jest.spyOn(logger, 'warn');
        winstonLogger.warn('warn message');
        expect(logger.warn).toBeCalledWith('warn message', { context: undefined });
    });
    test('should proxy debug correctly', () => {
        jest.spyOn(logger, 'debug');
        winstonLogger.debug('debug message');
        expect(logger.debug).toBeCalledWith('debug message', { context: undefined });
    });
    test('should proxy verbose correctly', () => {
        jest.spyOn(logger, 'verbose');
        winstonLogger.verbose('verbose message');
        expect(logger.verbose).toBeCalledWith('verbose message', { context: undefined });
    });
});
//# sourceMappingURL=winston.logger.spec.js.map