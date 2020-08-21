import * as NodeCache from 'node-cache';

const { CACHE_EXPIRY_TIMEOUT_SECONDS = '120' } = process.env;

/**
 * Memory cache client meant to cache data link key and mime-type pair
 */
export const nodeCache = new NodeCache({
  stdTTL: +CACHE_EXPIRY_TIMEOUT_SECONDS,
});
