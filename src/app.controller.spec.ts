import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { writeFileSync, existsSync } from 'fs';
import * as request from 'supertest';

import { AppModule } from 'src/app.module';
import { randomBytes } from 'crypto';
// __mocks__
import { httpClient, nodeCache } from 'src/common';

const { CACHE_DIRECTORY = 'cache' } = process.env;

describe('app.controller (e2e);', () => {
  let app: INestApplication, randomUrl: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    randomUrl = `/${randomBytes(4).toString('hex')}`;

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Check whether application respond properly as a proxy
   */

  describe('Proxy request;', () => {
    it('Internal Server Error: 204.', async () => {
      await request(app.getHttpServer())
        .get('/broken-url')
        .expect(204);
    });

    it('None processable data: 204.', async () => {
      await request(app.getHttpServer())
        .get(`${randomUrl}.css.map`)
        .expect(204);
    });

    it('Stream data: 200 Call corresponding target delivery url.', async () => {
      const url = `${randomUrl}.jpeg`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect((httpClient.get as jest.Mock).mock.calls[0][0]).toBe(url);
    });

    it('Text data: 200 Call corresponding target delivery url.', async () => {
      const url = `${randomUrl}.html`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect((httpClient.get as jest.Mock).mock.calls[0][0]).toBe(url);
    });
  });

  /**
   * Check whether application respond properly when cache is empty
   */

  describe('Cache MISS;', () => {
    it('Stream data: 200 pulling data.', async () => {
      const url = `${randomUrl}.jpeg`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(httpClient.get as jest.Mock).toBeCalled();
    });

    it('Text data: 200 pulling data.', async () => {
      const url = `${randomUrl}.html`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(httpClient.get as jest.Mock).toBeCalled();
    });

    it('Stream data: 200 Caching mime-type.', async () => {
      const url = `${randomUrl}.jpeg`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(
        nodeCache.get(
          `${process.cwd()}/${CACHE_DIRECTORY}/${url.replace(/\//g, '_')}`,
        ),
      ).toBeTruthy();
    });

    it('Text data: 200 Caching mime-type.', async () => {
      const url = `${randomUrl}.html`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(
        nodeCache.get(
          `${process.cwd()}/${CACHE_DIRECTORY}/${url.replace(/\//g, '_')}`,
        ),
      ).toBeTruthy();
    });

    it('Stream data: Save Data on hard-drive.', async () => {
      const url = `${randomUrl}.jpeg`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(
        existsSync(
          `${process.cwd()}/${CACHE_DIRECTORY}/${url.replace(/\//g, '_')}`,
        ),
      ).toBeTruthy();
    });

    it('Text data: Save Data on hard-drive.', async () => {
      const url = `${randomUrl}.html`;

      await request(app.getHttpServer())
        .get(url)
        .expect(200);

      expect(
        existsSync(
          `${process.cwd()}/${CACHE_DIRECTORY}/${url.replace(/\//g, '_')}`,
        ),
      ).toBeTruthy();
    });

    it("200 Set appropriate 'X-Cache' and 'X-Cache-Lookup' response header.", async () => {
      const response = await request(app.getHttpServer())
        .get(randomUrl)
        .expect(200);

      expect(response.header['x-cache']).toBe('MISS');
      expect(response.header['x-cache-lookup']).toBe('MISS');
    });
  });

  /**
   * Check whether application respond properly when cache is populated
   */

  describe('Cache HIT;', () => {
    let randomData: string;
    const mimeType = 'text/css; charset=utf-8';

    beforeEach(() => {
      nodeCache.set(
        `${process.cwd()}/${CACHE_DIRECTORY}/${randomUrl.replace(/\//g, '_')}`,
        mimeType,
      );
      randomData = randomBytes(64).toString('hex');
      writeFileSync(
        `${process.cwd()}/${CACHE_DIRECTORY}/${randomUrl.replace(/\//g, '_')}`,
        randomData,
      );
    });

    it('200 NOT pulling data.', async () => {
      await request(app.getHttpServer())
        .get(randomUrl)
        .expect(200);

      expect(httpClient.get as jest.Mock).not.toBeCalled();
    });

    it("200 Set appropriate 'Content-Type' response header.", async () => {
      const response = await request(app.getHttpServer())
        .get(randomUrl)
        .expect(200);

      expect(response.header['content-type']).toBe(mimeType);
    });

    it("200 Set appropriate 'X-Cache' and 'X-Cache-Lookup' response header.", async () => {
      const response = await request(app.getHttpServer())
        .get(randomUrl)
        .expect(200);

      expect(response.header['x-cache']).toBe('HIT');
      expect(response.header['x-cache-lookup']).toBe('HIT');
    });
  });
});
