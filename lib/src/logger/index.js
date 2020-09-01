"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLogger = exports.createNestWinstonLogger = exports.createExpressWinstonHandler = void 0;
var utils_logger_1 = require("./utils.logger");
Object.defineProperty(exports, "createExpressWinstonHandler", { enumerable: true, get: function () { return utils_logger_1.createExpressWinstonHandler; } });
Object.defineProperty(exports, "createNestWinstonLogger", { enumerable: true, get: function () { return utils_logger_1.createNestWinstonLogger; } });
var winston_logger_1 = require("./winston.logger");
Object.defineProperty(exports, "WinstonLogger", { enumerable: true, get: function () { return winston_logger_1.WinstonLogger; } });
//# sourceMappingURL=index.js.map