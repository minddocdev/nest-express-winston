import { cleanEnv, str } from 'envalid';
import * as path from 'path';

/**
 * The object that specifies the format of required vars.
 */
const validators = {
  ENVIRONMENT: str({
    devDefault: 'development',
    desc: 'The runtime environment',
    example: 'development',
    choices: ['development', 'test', 'qa', 'staging', 'production'],
  }),
  LOG_LEVEL: str({
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
  VERSION: str({
    devDefault: 'unknown',
    desc: 'The git commit hash that this server runs',
    example: '907fcbfb951e06f90b2519f3b923f2eab25ea9ae',
  }),
};

/**
 * The object that specifies options that set strict mode to true:
 * - The env object will only contain the env vars that were specified by the validators.
 * - Any attempt to access an invalid/missing property on the env object will cause a thrown error.
 * - Any attempt to mutate the cleaned env object will cause a thrown error.
 */
const options = {
  dotEnvPath: path.resolve(__dirname, '../.env'),
  strict: true,
};

export const env = cleanEnv(process.env, validators, options);
export const isKubernetesEnv = ['test', 'staging', 'production'].includes(env.ENVIRONMENT);
