# @hotcodepush/node

The typed Node client for the [HotCodePush](https://hotcodepush.com) REST API.

## Installation

The package is not on npm yet. Every commit on `main` is built to pkg.pr.new, so install one by its commit SHA and bump it deliberately, never `@main`:

```sh
npm install https://pkg.pr.new/hotcodepush-team/hotcodepush-node/@hotcodepush/node@<sha>
```

It requires Node.js 22 or later.

## Usage

```ts
import { HotCodePush } from '@hotcodepush/node';

// Reads the token from HOTCODEPUSH_TOKEN; pass `token` to set it yourself.
const hotCodePush = new HotCodePush();

const app = await hotCodePush.organizations.apps.create({
  framework: 'capacitor',
  name: 'Demo',
  organizationId: '<organization id>',
});
const channel = await hotCodePush.apps.channels.create({
  appId: app.id,
  name: 'staging',
});
await hotCodePush.apps.channels.pause({ appId: app.id, channelId: channel.id });

const [release] = await hotCodePush.apps.releases.list({
  appId: app.id,
  channelId: channel.id,
  number: 1,
});
```

The resources mirror the API's paths, `/v1/apps/{appId}/channels` being `apps.channels`, and every paginated list has a `count` beside it.
A boolean filter such as `isRead` takes a `boolean`.
Each attempt of a call may take 60 seconds; pass `timeout` in milliseconds to change it. A binary upload gets ten minutes per attempt.
A `baseUrl` with a path, such as `https://proxy.example/hcp`, keeps it in front of every route.
Uploads stream their body, a `Blob` or a `ReadableStream` with its `contentLength`.
Creating calls send an `Idempotency-Key` and are retried; pass `idempotencyKey` to reuse one across your own retries.
A failed request throws a `HotCodePushError` with the API's `code`, `message`, `details` and the HTTP `status`.

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
`npm run check-openapi-drift` compares the operations of `openapi.json` with the live API's; CI runs it after the tests.
`CLAUDE.md` holds the layout and the rules.

## License

See [LICENSE](./LICENSE).
