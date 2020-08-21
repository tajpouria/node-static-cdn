import { Injectable } from '@nestjs/common';
import { Stream } from 'stream';
import { createWriteStream } from 'fs';

import { DataProcessor, nodeCache } from 'src/common';

const {
  CACHE_DIRECTORY = 'cache',
  TARGET_HOST_URL = 'https://parspack.com',
  NONE_PROCESS_FILE_PATTERN = '.*.(?:css|js).map$',
  STREAM_PROCESS_FILE_PATTERN = '.*(?:jpg|gif|png|jpeg|webp|svg|otf|ttf|woff|woff2|eot|json|php)$',
  MINIFY_DATA = 'on',
  HOST_URL = 'http://localhost:8080',
} = process.env;

@Injectable()
export class AppService {
  /**
   * Inject memory cache
   */
  public cache: {
    get(key: string): string | undefined;
    set(key: string, value: any): boolean;
  } = nodeCache;

  /**
   * Generate data link from request request url
   * @param url Request url
   */
  public genDataLink(
    url: string,
  ): { key: string; processType: DataLinkProcessType } {
    let processType: DataLinkProcessType = 'text';

    if (url.match(new RegExp(NONE_PROCESS_FILE_PATTERN))) {
      processType = 'none';
    } else if (url.match(new RegExp(STREAM_PROCESS_FILE_PATTERN))) {
      processType = 'stream';
    }

    const keyPostFix = url.replace(/\//g, '_');
    return {
      key: `${process.cwd()}/${CACHE_DIRECTORY}/${keyPostFix}`,
      processType,
    };
  }

  /**
   * Save data on hard drive and assign store key: mime-type pair on cache
   * @param key Data-key
   * @param mimeType Data content-type
   * @param data The actual data stream
   */
  public cacheAs = (
    key: string,
    mimeType: string,
    data: Stream,
  ): Promise<void> => {
    const writer = createWriteStream(key);

    data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        this.cache.set(key, mimeType);
        resolve();
      });
      writer.on('error', reject);
    });
  };

  /**
   * Produce some set of operation on data based-on specified options
   * @param data The actual data string
   * @param mimeType Data content-type
   */
  public processData(data: string, mimeType = 'text/html'): string {
    const dp = new DataProcessor(mimeType);
    dp.data = data;

    // Replace after minify with less amount of content
    dp.findAndReplace(new RegExp(TARGET_HOST_URL, 'g'), HOST_URL);

    if (MINIFY_DATA === 'on') dp.minify();

    return dp.data;
  }
}

type DataLinkProcessType =
  // Data should NOT processed and cached
  | 'text'
  // Data should NOT processed but should cached
  | 'stream'
  // Data should NOT processed and cached
  | 'none';
