import axios from 'axios';

const { TARGET_HOST_URL = 'https://parspack.com' } = process.env;

export const httpClient = axios.create({
  baseURL: TARGET_HOST_URL,
});
