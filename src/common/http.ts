import axios from 'axios';

const { TARGET_HOST_URL = 'https://github.com' } = process.env;

/**
 * HttpClient meant to fetch not-cached data from target delivery host
 */
export const httpClient = axios.create({
  baseURL: TARGET_HOST_URL,
});
