# Node Static CDN [![Coverage Status](https://coveralls.io/repos/github/tajpouria/JWT-Memory-Authentication/badge.svg?branch=master)](https://coveralls.io/github/tajpouria/JWT-Memory-Authentication?branch=master)

Simple, typescript-based static web content CDN server, With the initial caching implementation.

## Configuration

Consider to change`.env` file environment variables for custom setup, Default configuration provided as follow:

```txt
NODE_ENV=deployment # Environment application running on (development|test|deployment)

PORT=8080 # Listening port

CACHE_EXPIRY_TIMEOUT_SECONDS=120 # Cache expiry window in seconds

CACHE_DIRECTORY=cache # Hard drive cache directory

TARGET_HOST_URL=https://github.com # Target host delivery URL

NONE_PROCESS_FILE_PATTERN=.*.(?:css|js).map$ # Regular expression of file name(s) that should not fetched from target

STREAM_PROCESS_FILE_PATTERN=.*(?:jpg|gif|png|jpeg|webp|svg|otf|ttf|woff|woff2|eot|json|php) # Regular expression of file name(s) That should handled as stream and do not need process

MINIFY_DATA=on # Should minify HTML, CSS and, JS

HOST_URL=http://localhost # Application host URL
```

## License

node-static-cdn is [MIT licensed](LICENSE).
