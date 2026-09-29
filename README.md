# @hotcodepush/node

The typed Node client for the [HotCodePush](https://hotcodepush.com) REST API.

## Installation

The package is not on npm yet; every commit on `main` is built to pkg.pr.new, so install one by its commit SHA:

```sh
npm install https://pkg.pr.new/hotcodepush-team/hotcodepush-node/@hotcodepush/node@<sha>
```

A consumer pins a commit and bumps it deliberately, never `@main`.

It requires Node.js 24 or later.

## Usage

```ts
import { HotCodePush } from '@hotcodepush/node';

const hotCodePush = new HotCodePush({ token: process.env.HOTCODEPUSH_TOKEN });

const organization = await hotCodePush.organizations.create({ name: 'Acme' });
const app = await hotCodePush.organizations.apps.create({
  framework: 'capacitor',
  name: 'Demo',
  organizationId: organization.id,
});
const channel = await hotCodePush.apps.channels.create({
  appId: app.id,
  name: 'staging',
});
await hotCodePush.apps.channels.pause({ appId: app.id, channelId: channel.id });
```

The resources mirror the API's paths, `/v1/apps/{appId}/channels` being `apps.channels`:

| Resource                                   | Methods                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| `health`                                   | `get`                                                          |
| `organizations`                            | `create`, `delete`, `get`, `list`, `update`                    |
| `organizations.apps`                       | `create`, `list`                                               |
| `organizations.invitations`                | `create`, `delete`, `list`                                     |
| `organizations.members`                    | `delete`, `get`, `list`, `update`                              |
| `invitations`, the caller's                | `accept`, `list`                                               |
| `apps`                                     | `delete`, `get`, `transfer`, `update`                          |
| `apps.bundles`                             | `complete`, `create`, `delete`, `get`, `list`                  |
| `apps.bundles.pack`, `apps.bundles.deltas` | `upload`                                                       |
| `apps.channels`                            | `create`, `delete`, `get`, `list`, `pause`, `resume`, `update` |
| `apps.channels.indexes`                    | `get`                                                          |
| `apps.channels.releases`, the release log  | `create`, `list`                                               |
| `apps.channels.rollbacks`                  | `create`                                                       |
| `apps.embeddedBundles`                     | `create`, `get`, `list`                                        |
| `apps.files`                               | `upload`                                                       |
| `apps.files.uploads`, the multipart upload | `complete`, `create`, `delete`                                 |
| `apps.files.uploads.parts`                 | `upload`                                                       |
| `apps.releases`                            | `get`, `list`, `pause`, `resume`, `revoke`, `update`           |
| `users`                                    | `delete`, `get`                                                |

Lists take `limit` and `offset`, and where the API embeds linked rows, `relations`: `organizations.members.list({ organizationId, relations: ['user'] })`.
`users.get({ userId: 'me' })` answers the caller behind the token, and `users.delete({ userId: 'me' })` deletes the caller's account, as `me` addresses the caller wherever the API takes a `{userId}`.

An upload streams its body, a `Blob` or a `ReadableStream` with its `contentLength`, never buffering it:

```ts
import { openAsBlob } from 'node:fs';

await hotCodePush.apps.files.upload({
  appId: app.id,
  body: await openAsBlob('dist/index.html.gz'),
  sha256: '<sha256 of the uncompressed file>',
});
```

An upload attempt may take ten minutes, `UPLOAD_TIMEOUT_MS`, enough for a 512 MB body at one megabyte a second; every other call gets sixty seconds.
A `Blob` is read again when a retry needs it; a stream is read once, so a failed stream upload is not retried.

Every creating call sends an `Idempotency-Key`, a UUID per call kept across the client's own retries; pass `idempotencyKey` to reuse one when you retry the call yourself, and the API answers the first result again for 24 hours.

A failed request throws a `HotCodePushError` carrying the API's `code`, `message` and `details` and the HTTP `status`.

## Documentation

The documentation lives at [hotcodepush.com/docs](https://hotcodepush.com/docs).

## Development

```sh
nvm use
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run fmt` applies ESLint's fixes and Prettier.

## License

See [LICENSE](./LICENSE).
