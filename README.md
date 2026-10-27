# fg-cw-frontend

Case worker frontend application

- [Running with other services](#running-with-other-services)
- [Requirements](#requirements)
  - [Node.js](#nodejs)
- [Server-side Caching](#server-side-caching)
- [Redis](#redis)
- [Local Development](#local-development)
  - [Setup](#setup)
  - [Development](#development)
  - [Production](#production)
  - [Npm scripts](#npm-scripts)
  - [Update dependencies](#update-dependencies)
  - [Formatting](#formatting)
    - [Windows prettier issue](#windows-prettier-issue)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
  - [Dependabot](#dependabot)
  - [SonarCloud](#sonarcloud)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Running with other services

fg-cw-frontend needs fg-cw-backend (and the Entra stub to sign in) to do anything useful, so the easiest way to run it is
with the rest of Farming Grants: check out [fg-grants-core](https://github.com/DEFRA/fg-grants-core) alongside this repo and run
`npm run stack cw` there. fg-grants-core runs the shared infrastructure and
wires the services together.

This repo's own `compose.yml` only runs redis and this service. To work on it
without fg-grants-core, run what it calls separately and start this service
with `npm run dev` (see [Local Development](#local-development)).

Both ways use this repo's `compose/compose.cw-frontend.yml`, so:

- Container env goes in the `environment:` block of `compose/compose.cw-frontend.yml`.
  `.env` is for running node on your machine.
- Values that only make sense in the full stack, such as other services' URLs
  and tokens, stay in fg-grants-core's `compose/compose.override.yml`.
- Keep the infrastructure versions in `compose.yml` the same as
  fg-grants-core's. `npm run stack` there warns when they differ.

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
cd fg-cw-frontend
nvm use
```

## Server-side Caching

We use Catbox for server-side caching. By default the service will use CatboxRedis when deployed and CatboxMemory for
local development.
You can override the default behaviour by setting the `SESSION_CACHE_ENGINE` environment variable to either `redis` or
`memory`.

Please note: CatboxMemory (`memory`) is _not_ suitable for production use! The cache will not be shared between each
instance of the service and it will not persist between restarts.

## Redis

Redis is an in-memory key-value store. Every instance of a service has access to the same Redis key-value store similar
to how services might have a database (or MongoDB). All frontend services are given access to a namespaced prefixed that
matches the service name. e.g. `my-service` will have access to everything in Redis that is prefixed with `my-service`.

If your service does not require a session cache to be shared between instances or if you don't require Redis, you can
disable setting `SESSION_CACHE_ENGINE=false` or changing the default value in `~/src/config/index.js`.

## Local Development

### Setup

Install application dependencies:

```bash
npm install
```

### Development

To run the application locally:

1. Clone and run the backend service (https://github.com/DEFRA/fg-cw-backend) using `CW_PORT=3101 docker compose up` (Note: The backend service runs on port 3101 (not the default 3000))
2. run `docker compose up redis`
3. Once the backend is running, you can start the frontend application using the provided script

```bash
npm run dev
```

### Production

To mimic the application running in `production` mode locally run:

```bash
npm start
```

### Npm scripts

All available Npm scripts can be seen in [package.json](./package.json)
To view them in your command line run:

```bash
npm run
```

### Update dependencies

To update dependencies use [npm-check-updates](https://github.com/raineorshine/npm-check-updates):

> The following script is a good start. Check out all the options on
> the [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

```bash
ncu --interactive --format group
```

### Formatting

#### Windows prettier issue

If you are having issues with formatting of line breaks on Windows update your global git config by running:

```bash
git config --global core.autocrlf false
```

## Logging

This application uses [Pino](https://getpino.io/) for structured logging, configured with ECS (Elastic Common Schema) formatting for better observability and log analysis.

Logging is configured in `src/common/logger.js`.

### Basic Logging

We use entry and exit level logging patterns for better log correlation.

**Entry logs** indicate the start of an operation:

**Exit logs** indicate the completion of an operation:

> **Note**: We use consistent entry text to make it easier to correlate logs within OpenSearch.

### Conditional Logging

For operations that have conditional logic between entry and exit logs, use `logger.debug()` or `logger.info()` based on relevance:

**Example implementation**:

```javascript
logger.info(
  `Handle agreement status update use case started ${data.caseRef} and workflowCode ${data.workflowCode}`,
);

if (data?.supplementaryData) {
  await updateSupplementaryDataUseCase(data);
  logger.debug(
    `Updated case status with caseRef "${data.caseRef}" and workflowCode "${data.workflowCode}"`,
  );
}
logger.info(
  `Finished: Handle agreement status update use case started ${data.caseRef} and workflowCode ${data.workflowCode}`,
);
```

### Log Levels

**Warning logs** for recoverable issues:

**Debug logs** for detailed diagnostic information:

> **Note**: Error logging (`logger.error`) is typically not required in use cases as errors are thrown and will propagate up the call stack where they can be handled and logged by the error handling middleware.

### Best Practices

- Use structured logging with context objects for better searchability
- Include relevant identifiers (IDs, codes, references) in log messages
- Keep entry and exit log messages consistent for easier correlation
- Use appropriate log levels based on the importance of the information
-

### Proxy

We are using forward-proxy which is set up by default. To make use of this: `import { fetch } from 'undici'` then
because of the `setGlobalDispatcher(new ProxyAgent(proxyUrl))` calls will use the ProxyAgent Dispatcher

If you are not using Wreck, Axios or Undici or a similar http that uses `Request`. Then you may have to provide the
proxy dispatcher:

To add the dispatcher to your own client:

```javascript
import { ProxyAgent } from "undici";

return await fetch(url, {
  dispatcher: new ProxyAgent({
    uri: proxyUrl,
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10,
  }),
});
```

## Docker

### Development image

Build:

```bash
docker build --target development --no-cache --tag fg-cw-frontend:development .
```

Run:

```bash
docker run -p 3100:3000 fg-cw-frontend:development
```

### Production image

Build:

```bash
docker build --no-cache --tag fg-cw-frontend .
```

Run:

```bash
docker run -p 3100:3000 fg-cw-frontend
```

### Docker Compose

`compose.yml` runs redis and this service:

```bash
docker compose up --build -d
```

It doesn't run fg-cw-backend, and its network isn't shared with fg-cw-backend's
own `compose.yml`, so on its own the frontend can't reach a backend. To run them
together use fg-grants-core (see
[Running with other services](#running-with-other-services)).

### Dependabot

We have added an example dependabot configuration file to the repository. You can enable it by renaming
the [.github/example.dependabot.yml](.github/example.dependabot.yml) to `.github/dependabot.yml`

### SonarCloud

Instructions for setting up SonarCloud can be found in [sonar-project.properties](./sonar-project.properties).

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

## Synthetic test data

> [!NOTE]
> Keep fixtures, snapshots and documentation examples synthetic. Use clearly fictional example businesses and people, `900000...` customer identifiers, `example.test` email addresses, `ZZ99` postcodes, `AA` land references and scheme-prefixed agreement references with `900000...` suffixes. Use reserved drama ranges for telephone numbers. Keep shared identifiers and their expected values consistent across tests and contracts. Never copy customer or staff records from a live environment.
