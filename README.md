# @hotcodepush/node

The typed Node client for the [HotCodePush](https://hotcodepush.com) REST API.

## Installation

The package is not on npm yet; every commit on `main` is built to pkg.pr.new, so install one by its commit SHA:

```sh
npm install https://pkg.pr.new/hotcodepush-team/hotcodepush-node/@hotcodepush/node@<sha>
```

A consumer pins a commit and bumps it deliberately, never `@main`.

It requires Node.js 22 or later.

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

| Resource                                                                                   | Methods                                                                               |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `health`                                                                                   | `get`                                                                                 |
| `organizations`                                                                            | `count`, `create`, `delete`, `get`, `list`, `update`                                  |
| `organizations.apps`                                                                       | `count`, `create`, `list`                                                             |
| `organizations.auditLogs`                                                                  | `count`, `downloadCsv`, `list`                                                        |
| `organizations.invitations`                                                                | `count`, `create`, `delete`, `deleteMany`, `list`                                     |
| `organizations.members`                                                                    | `count`, `delete`, `deleteMany`, `get`, `list`, `update`                              |
| `organizations.billing`, the plan, the subscription, the spending cap and this month's MAU | `get`, `update`                                                                       |
| `organizations.checkouts`, enabling billing through Polar                                  | `create`                                                                              |
| `organizations.customerPortalSessions`, Polar's portal for invoices and the card           | `create`                                                                              |
| `organizations.limits`, the limits in effect                                               | `get`                                                                                 |
| `organizations.subscription`                                                               | `cancel`, `uncancel`                                                                  |
| `organizations.usage`, each app's MAU and bytes for a month                                | `downloadCsv`, `get`                                                                  |
| `organizations.ssoProvider`, one per organization                                          | `delete`, `get`, `put`                                                                |
| `organizations.ssoProvider.verifications`                                                  | `create`                                                                              |
| `invitations`, the caller's                                                                | `accept`, `count`, `list`                                                             |
| `apps`                                                                                     | `delete`, `get`, `transfer`, `update`                                                 |
| `apps.bundles`                                                                             | `complete`, `count`, `create`, `delete`, `get`, `list`                                |
| `apps.bundles.files`, a bundle's files ordered by path                                     | `count`, `list`                                                                       |
| `apps.bundles.pack`, `apps.bundles.deltas`                                                 | `upload`                                                                              |
| `apps.bundles.pack.uploads`, `apps.bundles.deltas.uploads`, the multipart upload           | `complete`, `create`, `delete`                                                        |
| `apps.bundles.pack.uploads.parts`, `apps.bundles.deltas.uploads.parts`                     | `upload`                                                                              |
| `apps.channels`                                                                            | `count`, `create`, `delete`, `deleteMany`, `get`, `list`, `pause`, `resume`, `update` |
| `apps.channels.indexes`                                                                    | `get`                                                                                 |
| `apps.channels.qr`, the channel's deep link as an image                                    | `get`                                                                                 |
| `apps.channels.releases`, the release log                                                  | `count`, `create`, `list`, `revoke`                                                   |
| `apps.channels.rollbacks`                                                                  | `create`                                                                              |
| `apps.binaries`, the store builds `binary create` creates                                  | `count`, `create`, `get`, `list`                                                      |
| `apps.channels.audience`, the audience preview                                             | `get`                                                                                 |
| `apps.devices`                                                                             | `count`, `delete`, `deleteMany`, `get`, `list`                                        |
| `apps.signingKeys`                                                                         | `count`, `create`, `delete`, `list`                                                   |
| `apps.statistics.fleet`, the registry counted by dimension                                 | `get`                                                                                 |
| `apps.statistics.updates`, `apps.statistics.usage`, the time-series read models            | `get`                                                                                 |
| `apps.files`                                                                               | `upload`                                                                              |
| `apps.files.uploads`, the multipart upload                                                 | `complete`, `create`, `delete`                                                        |
| `apps.files.uploads.parts`                                                                 | `upload`                                                                              |
| `apps.releases`                                                                            | `count`, `get`, `list`, `pause`, `resume`, `revoke`, `update`                         |
| `apps.releases.audience`, a release's own audience                                         | `get`                                                                                 |
| `users`                                                                                    | `delete`, `get`                                                                       |
| `users.password`                                                                           | `create`                                                                              |
| `users.sessions`, `users.tokens`                                                           | `deleteMany`                                                                          |
| `notifications`, the caller's in-app notifications                                         | `count`, `list`, `update`, `updateMany`                                               |
| `notificationPreferences`, the caller's matrix of types and media                          | `list`, `update`                                                                      |

Lists take `limit` and `offset`, and where the API embeds linked rows, `relations`: `organizations.members.list({ organizationId, relations: ['user'] })`; any other list parameter, an audience's `attribute` say, repeats itself in the query.
Every paginated list has a `count` beside it taking the same filters and answering `{ total }`, the number a paginated table reads; `notificationPreferences.list` answers the whole matrix at once and has none.
`users.get({ userId: 'me' })` answers the caller behind the token, and `users.delete({ password, userId: 'me' })` deletes the caller's account once its password checks out, as `me` addresses the caller wherever the API takes a `{userId}`.

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

Every creating call but a checkout and a customer portal session sends an `Idempotency-Key`, a UUID per call kept across the client's own retries; pass `idempotencyKey` to reuse one when you retry the call yourself, and the API answers the first result again for 24 hours. A checkout and a portal session carry no key and are never retried, since each call opens another Polar object; a click repeats them.

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
