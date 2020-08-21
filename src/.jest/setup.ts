import * as rimraf from 'rimraf';
import { mkdirSync, existsSync } from 'fs';
//@ts-ignore
import { nodeCache } from '../common';

jest.mock('src/common/http');

const { CACHE_DIRECTORY = 'cache' } = process.env;

beforeEach(() => {
  // Create cache folder
  if (!existsSync(`${process.cwd()}/${CACHE_DIRECTORY}`))
    mkdirSync(`${process.cwd()}/${CACHE_DIRECTORY}`);
});

afterEach(() => {
  // Restart mocks
  jest.clearAllMocks();

  // Flushing node-cache
  nodeCache.flushAll();

  // Remove cache folder
  rimraf.sync(`${process.cwd()}/${CACHE_DIRECTORY}`);
});

afterAll(() => {
  nodeCache.close();
});
