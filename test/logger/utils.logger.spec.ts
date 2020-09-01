import { oneLineTrim } from 'common-tags';
import * as expressWinston from 'express-winston';
import * as fs from 'fs';
import { TransformableInfo } from 'logform';
import * as winston from 'winston';

import { createExpressWinstonHandler, createNestWinstonLogger } from '../../src';
import * as config from '../../src/config';

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
    const stubFormat = (infoStub: TransformableInfo) => ({
      combine: jest.fn((...args) => args),
      colorize: jest.fn(() => 'colorize'),
      label: jest.fn(label => label),
      logstash: jest.fn(() => 'logstash'),
      printf: jest.fn(templateFunction => templateFunction(infoStub)),
      timestamp: jest.fn(() => 'timestamp'),
    });

    test('development', () => {
      // @ts-ignore
      config.env.ENVIRONMENT = 'development';
      // @ts-ignore
      config.isKubernetesEnv = false;

      // @ts-ignore: need to remock the format as it was call with a function first time
      winston.format = stubFormat(infoStub);

      createNestWinstonLogger(label);

      // In the mock, we also pass the timestamp though in development it is actually not there
      const expectedPrintfFormat = oneLineTrim`
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
      // @ts-ignore
      config.env.ENVIRONMENT = 'production';
      // @ts-ignore
      config.isKubernetesEnv = true;

      // @ts-ignore: need to remock the format as it was call with a function first time
      winston.format = stubFormat(infoStub);

      createNestWinstonLogger(label);

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
      let originalPlatform: NodeJS.Platform;

      beforeEach(() => {
        originalPlatform = process.platform;
      });

      afterEach(() => {
        // process.platform is a read only property, needs to be assigned like this
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      });

      test('to NUL in windows', () => {
        jest.spyOn(fs, 'createWriteStream').mockImplementationOnce(jest.fn());
        Object.defineProperty(process, 'platform', { value: 'win32' });
        createNestWinstonLogger(label);
        expect(fs.createWriteStream).toBeCalledWith('\\\\.\\NUL');
      });

      test('to /dev/null in other platforms', () => {
        // tslint:disable-next-line: ter-arrow-parens
        (['darwin', 'freebsd', 'linux', 'sunos'] as NodeJS.Platform[]).forEach(platform => {
          jest.spyOn(fs, 'createWriteStream').mockImplementationOnce(jest.fn());
          Object.defineProperty(process, 'platform', { value: platform });
          createNestWinstonLogger(label);
          expect(fs.createWriteStream).toBeCalledWith('/dev/null');
        });
      });
    });
  });

  test('create express winston handler', () => {
    const loggerStub = {} as winston.Logger;
    createExpressWinstonHandler(loggerStub);

    const calledParam = (expressWinston.logger as jest.Mock).mock.calls[0][0];
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
        cookie: 'AccessToken=Secret; RefreshToken=Secret; OtherCookie=NoSecret',
      },
      fake: { param: 'isFake' },
    };
    expect(requestFilter(req, 'headers')).toEqual({
      authorization: 'Bearer [REDACTED]',
      'if-none-match': 'EXCLUDED',
      cookie: 'AccessToken=REDACTED; RefreshToken=REDACTED; OtherCookie=NoSecret',
    });
    expect(requestFilter(req, 'fake')).toEqual(req.fake);
    expect(requestFilter({ headers: { test: '1' } }, 'headers')).toEqual({ test: '1' });
  });
});
