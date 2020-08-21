import { Readable } from 'stream';

/**
 * Axios instance mock implementation
 */
export const httpClient = {
  get: jest.fn().mockImplementation(
    (url: string, options: { responseType?: undefined | 'stream' } = {}) =>
      new Promise((resolve, reject) => {
        if (url === '/broken-url') reject('broken-url');
        else
          resolve({
            headers: {
              'content-type': 'text/html',
            },
            data:
              options.responseType === 'stream'
                ? Readable.from(['<html></html>'])
                : '<html></html>',
          });
      }),
  ),
};
