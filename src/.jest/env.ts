process.env = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '8080',
  CACHE_DIRECTORY: 'cache',
  HOST_URL: 'http://localhost:8080',
  TARGET_HOST_URL: 'https://github.com',
  CACHE_EXPIRY_TIMEOUT_SECONDS: '120',
  NONE_PROCESS_FILE_PATTERN: '.*.css.map$',
  STREAM_PROCESS_FILE_PATTERN:
    '.*(?:jpg|gif|png|jpeg|webp|svg|otf|ttf|woff|woff2|eot|json|php)$',
  MINIFY_DATA: 'on',
};
