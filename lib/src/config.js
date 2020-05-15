"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKubernetesEnv = exports.env = void 0;
const envalid_1 = require("envalid");
const path = require("path");
const environments = ['development', 'concurrent', 'unit', 'integration', 'test', 'qa', 'staging', 'production'];
const validators = {
    ENVIRONMENT: envalid_1.str({
        devDefault: 'development',
        desc: 'The runtime environment',
        example: 'development',
        choices: environments,
    }),
    LOG_LEVEL: envalid_1.str({
        devDefault: 'debug',
        desc: 'The winston log level',
        example: 'info',
        choices: [
            'error',
            'warn',
            'help',
            'data',
            'info',
            'debug',
            'prompt',
            'http',
            'verbose',
            'input',
            'silly',
        ],
    }),
    NODE_ENV: envalid_1.str({
        choices: environments,
        default: 'development',
    }),
    VERSION: envalid_1.str({
        devDefault: 'unknown',
        desc: 'The git commit hash that this server runs',
        example: '907fcbfb951e06f90b2519f3b923f2eab25ea9ae',
    }),
};
const options = {
    dotEnvPath: path.resolve(__dirname, '../.env'),
    strict: true,
};
exports.env = envalid_1.cleanEnv(process.env, validators, options);
exports.isKubernetesEnv = ['test', 'staging', 'production'].includes(exports.env.ENVIRONMENT);
//# sourceMappingURL=config.js.map