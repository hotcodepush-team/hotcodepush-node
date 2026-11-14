# @hotcodepush/node

[![npm](https://img.shields.io/npm/v/@hotcodepush/node)](https://www.npmjs.com/package/@hotcodepush/node)

The typed Node.js client for the [HotCodePush](https://hotcodepush.com) REST API, the over-the-air (OTA) update platform for React Native, Expo, Capacitor and Cordova.

## Installation

```sh
npm install @hotcodepush/node
```

It is ES modules only and requires Node.js 22 or later.

## Usage

```ts
import { HotCodePush } from '@hotcodepush/node';

const hotCodePush = new HotCodePush({ token: process.env.HOTCODEPUSH_TOKEN });

const [organization] = await hotCodePush.organizations.list();
const app = await hotCodePush.organizations.apps.create({
  framework: 'capacitor',
  name: 'Demo',
  organizationId: organization.id,
});
const channel = await hotCodePush.apps.channels.create({
  appId: app.id,
  name: 'staging',
});
```

`token` is an API token from the console's [API tokens](https://console.hotcodepush.com/settings/tokens) page. Left out, the client reads `HOTCODEPUSH_TOKEN`.
The resources mirror the API's paths, `/v1/apps/{appId}/channels` being `apps.channels`, and every paginated list has a `count` beside it.
Uploads stream their body, a `Blob` or a `ReadableStream` with its `contentLength`.
Creating calls send an `Idempotency-Key` and are retried. Pass `idempotencyKey` to reuse one across your own retries.
A failed request throws a `HotCodePushError` with the API's `code`, `message`, `details` and the HTTP `status`.

`request` sends one request to any path of the API and returns the `Response` as received, for an endpoint or an answer that no method covers:

```ts
const response = await hotCodePush.request({
  method: 'GET',
  path: '/v1/organizations?limit=1',
});
const organizations = await response.json();
```

The path starts with a slash and carries its own query string, and a `body` is sent as JSON.

## Documentation

See [hotcodepush.com/docs/api/node](https://hotcodepush.com/docs/api/node) for this client and [hotcodepush.com/docs](https://hotcodepush.com/docs) for HotCodePush.

## Development

```sh
nvm use
npm ci
npm run build        # tsdown into dist/
npm test
npm run lint && npm run typecheck
npm run fmt          # ESLint's fixes and Prettier, run before every commit
```

`npm run sync-openapi` fetches the API's OpenAPI document into `openapi.json`, and `npm run generate` regenerates the types from it.
`npm run check-openapi-drift` compares the operations of `openapi.json` with the live API's. CI runs it after the tests.
`CLAUDE.md` holds the layout and the rules.

## License

See [LICENSE](./LICENSE).
