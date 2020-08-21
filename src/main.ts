import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

import { AppModule } from 'src/app.module';
import { objectContainsAll } from 'src/common';

async function bootstrap() {
  // objectContainsAll(
  //   process.env,
  //   ['HOST', 'PORT', 'CACHE_EXPIRY_TIMEOUT_SECONDS', 'CACHE_DIRECTORY'],
  //   'Does not exists on process.env,
  // );

  const {
    PORT = 8080,
    CACHE_DIRECTORY = 'cache',

    HOST_URL = 'http://localhost:8080',
    TARGET_HOST_URL = 'https://parspack.com',
  } = process.env;

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
