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

await hotCodePush.health.get();
```

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
