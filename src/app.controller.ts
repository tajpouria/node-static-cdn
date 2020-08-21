import { Controller, Get, Req, Res, Header, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { Stream, Readable } from 'stream';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { AppService } from 'src/app.service';
import { httpClient } from 'src/common';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Meant to deliver request-associated content from target host
   */
  @Get('*')
  @Header('X-Cache', 'MISS')
  @Header('X-Cache-Lookup', 'MISS')
  async deliverContent(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const {
      logger,
      appService: { genDataLink, cache, cacheAs, processData },
    } = this;
    const { url } = request;
    const dataLink = genDataLink(url);

    let mimeType: string | undefined;

    if ((mimeType = cache.get(dataLink.key))) {
      // Data is already cached and cache is valid

      logger.info(`HIT '${dataLink.key}'`);
      response.setHeader('X-Cache', 'HIT');
      response.setHeader('X-Cache-Lookup', 'HIT');
    } else {
      try {
        // Data is NOT cached or cache is  no longer valid

        if (dataLink.processType === 'none') {
          // Data should NOT processed and cached

          response.sendStatus(204);
          return;
        } else if (dataLink.processType === 'stream') {
          // Data should NOT processed but should cached

          logger.info(`Pull '${url}'`);
          const { data, headers } = await httpClient.get<Stream>(url, {
            responseType: 'stream',
          });

          mimeType = headers['content-type'];

          logger.info(`Cache '${dataLink.key}'`);
          await cacheAs(dataLink.key, mimeType, data);
        } else {
          // Data should BOTH processed but should cached

          logger.info(`Pull ${url}`);
          const { data, headers } = await httpClient.get<string>(url);

          mimeType = headers['content-type'];

          logger.info(`Processing '${dataLink.key}'`);
          const pd = processData(data, mimeType);

          logger.info(`Cache '${dataLink.key}'`);
          await cacheAs(dataLink.key, mimeType, Readable.from([pd]));
        }
      } catch (error) {
        logger.warn(error);

        response.sendStatus(204);
        return;
      }
    }

    // Setting mime-type and send relative linked data
    response.set('Content-Type', mimeType);
    response.sendFile(dataLink.key);
  }
}
