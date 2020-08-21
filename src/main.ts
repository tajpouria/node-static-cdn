import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

import { AppModule } from 'src/app.module';
import { objectContainsAll } from 'src/common';

async function bootstrap() {
  // Check if All required environment variable already defined
  objectContainsAll(
    process.env,
    [
      'NODE_ENV',
      'PORT',
      'CACHE_EXPIRY_TIMEOUT_SECONDS',
      'CACHE_DIRECTORY',
      'TARGET_HOST_URL',
      'NONE_PROCESS_FILE_PATTERN',
      'STREAM_PROCESS_FILE_PATTERN',
      'MINIFY_DATA',
      'HOST_URL',
    ],
    'Does not exists on process.env',
  );

  const {
    PORT = '8080',
    CACHE_DIRECTORY = 'cache',
    HOST_URL = 'http://localhost:8080',
    TARGET_HOST_URL = 'https://parspack.com',
  } = process.env;

  // Create cache folder
  if (!existsSync(`${process.cwd()}/${CACHE_DIRECTORY}`))
    mkdirSync(`${process.cwd()}/${CACHE_DIRECTORY}`);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');

  await app.listen(PORT);
  console.info(
    `HostURL: '${HOST_URL}', DeliverContentHostURL: '${TARGET_HOST_URL}'`,
  );
}
bootstrap();
