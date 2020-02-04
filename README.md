# nest-express-winston

Implementation of a NestJS logger using `winston` and `express-winston`. It replaces the default
NestJS logger with `winston`, and optionally also adds express logs using `express-winston`.

## Getting Started

```bash
yarn install
```

```bash
yarn build
```

```bash
yarn test
```

## Installation

```bash
yarn add @minddocdev/nest-express-winston
```

## Publishing

To publish a new version of the package, firstly bump the version in the `package.json` file,
then cut a new release on [Github](https://github.com/minddocdev/nest-express-winston/releases).
This will automatically initiate the `publish` Github Action workflow and publish a new version to
[Github Packages](https://github.com/minddocdev/nest-express-winston/packages)

## Guide

```typescript
import {
  createExpressWinstonHandler,
  createNestWinstonLogger,
  httpContextMiddleware,
  requestIdHandler,
} from '@minddocdev/nest-express-winston';
```

### Basic Example

Add the following to your `index.ts` / `main.ts`:

```typescript
import 'dotenv/config';
import 'module-alias/register';
import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import {
  createExpressWinstonHandler,
  createNestWinstonLogger,
  httpContextMiddleware,
  requestIdHandler,
} from '@minddocdev/nest-express-winston';

import { AppModule } from './app.module';
import { EnvService } from './env';

async function bootstrap() {
  const nestWinstonLogger = createNestWinstonLogger('app');
  const app = await NestFactory.create(AppModule, { logger: nestWinstonLogger });

  // Use express-winston for logging request information
  const expressWinstonHandler = createExpressWinstonHandler(nestWinstonLogger.logger);
  app.use(expressWinstonHandler);

  // Use express-http-context for context injection (request id)
  app.use(httpContextMiddleware);
  app.use(requestIdHandler);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix(EnvService.get().API_BASE_PATH);

  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Logging API Example')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(EnvService.get().API_PORT, EnvService.get().API_HOST);
}
bootstrap();
```

## Contribution Guidelines

Never commit directly to master, create a new branch and submit a pull request.
