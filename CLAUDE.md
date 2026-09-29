# CLAUDE.md

`@hotcodepush/node`, the typed Node client for the HotCodePush REST API, modeled on Capawesome's [`cloud-node`](https://github.com/capawesome-team/cloud-node).
The CLI and the MCP server depend on it like any customer does, so the API contract is dogfooded through this package.
Stack: TypeScript, tsdown for the build (ESM plus types), openapi-typescript for the types, Vitest; no runtime dependency.

The API contract is planned in the private `handbook` repo, checked out beside this one by maintainers: `../handbook/docs/api.md`, its Conventions and Errors sections above all.
When the code and the contract disagree, stop and surface it; never improvise.
The client is validated against the API's OpenAPI document, the contract; see [The OpenAPI snapshot](#the-openapi-snapshot).

## Layout

```
openapi.json               the snapshot of the API's OpenAPI document, committed
scripts/sync-openapi.ts    fetches the document into openapi.json
src/index.ts               the public exports
src/client.ts              HotCodePush: the options and one property per top-level resource
src/http-client.ts         the one place that calls fetch: the headers, withTimeout, withRetry, JSON in and out
src/errors.ts              HotCodePushError and the parsing of the one error shape
src/types.ts               the shapes every resource shares and the helpers deriving types from the snapshot
src/generated/schema.d.ts  openapi-typescript's types of the snapshot, committed, never edited
src/resources/             one file per resource, its types beside it
src/openapi.test.ts        the contract test: every resource method against the snapshot
src/integration.test.ts    the client against a running API, skipped unless HOTCODEPUSH_API_BASE_URL is set
```

Resources mirror the paths: `/v1/organizations/{organizationId}/apps` is `organizations.apps`, `/v1/apps/{appId}/channels/{channelId}/releases` is `apps.channels.releases`; a resource nests on the one its path sits under, and a path collection is one class.
Every type a resource takes or returns is derived from the snapshot through `src/types.ts`, and every path goes through `resolvePath`, typed on the snapshot's paths; the one hand-written piece is a `relations` allow-list, since the document types it as a free string.

Tests live beside the code they test, `*.test.ts` next to the file, and stub the global `fetch` through `src/test-helpers.ts`; nothing calls the real API but the integration test, run by hand.

## Commands

| Command                | Does                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `npm run build`        | tsdown into `dist/`                                          |
| `npm run lint`         | ESLint and Prettier's check                                  |
| `npm run fmt`          | ESLint's fixes and Prettier                                  |
| `npm test`             | Vitest                                                       |
| `npm run typecheck`    | the generated types' freshness check, then `tsc --noEmit`    |
| `npm run generate`     | openapi-typescript from `openapi.json` into `src/generated/` |
| `npm run sync-openapi` | `<HOTCODEPUSH_API_BASE_URL>/openapi` into `openapi.json`     |

Run `npm run fmt` before every commit; lint, typecheck, test and build must pass, and CI runs the four on every pull request and push to `main`, then publishes the build to pkg.pr.new.
`.prettierignore` keeps the files copied from the monorepo and `.github` verbatim, and the snapshot and its generated types as they were written.

## The API contract

- Auth is `Authorization: Bearer <token>`; the token is optional, since `/health` needs none.
- Every request sends `X-HotCodePush-Client: <name>/<version>`, `node/<this package's version>` unless the caller passes its own, as the CLI and the MCP server do.
- Every error is one JSON shape, `code`, `message`, `details`; `HotCodePushError` carries them and the status verbatim, and a body without the shape becomes `E_INTERNAL`.
- Every call goes through `withTimeout` and `withRetry`, never a bare `fetch`: sixty seconds per attempt, three attempts, exponential backoff from 500 ms, retrying a thrown fetch, 408, 429 and 5xx.
- Every creating `POST` — a `POST` on a collection, never a transition such as `pause` — goes through `fetchCreatingPost`, which sends the caller's `idempotencyKey` or a UUID generated per call and kept across its retries.
- Lists take `limit` and `offset`; `relations` is a typed list sent as the comma list `?relations=user`.
- `me` is accepted wherever a `{userId}` appears; the client passes it through.
- The `/v1/auth/*` slice is Better Auth's and outside the document; its client lives in the CLI and the console, never here.
- Streaming upload bodies arrive with the bundles and files endpoints.

## The OpenAPI snapshot

The API's `/openapi` document is the contract, and `openapi.json` is its committed snapshot, so the package builds and CI checks without the API.
A schema change breaks the build three ways: the types in `src/generated/schema.d.ts` stop compiling where a resource uses them, `npm run typecheck` fails while the generated file is stale, and `src/openapi.test.ts` fails when a method sends a path, method, query parameter or body the snapshot lacks, or when a resource method has no call there.

When the API changes:

1. Run the API locally, as `apps/api-worker/README.md` in the monorepo says.
2. `HOTCODEPUSH_API_BASE_URL=http://localhost:8787 npm run sync-openapi`, then `npm run generate`.
3. Fix what no longer compiles or passes, add the resource methods for new endpoints and their calls in `src/openapi.test.ts`.
4. Commit `openapi.json` and `src/generated/` with the change; both are never edited by hand.

The integration test runs by hand against that API, started with `ENVIRONMENT=dev` and `DEV_DATABASE_URL` in its `.dev.vars` so the mail lands in its log: sign up through `POST /v1/auth/sign-up/email`, send the logged link's token to `GET /v1/auth/verify-email?token=`, sign in through `POST /v1/auth/sign-in/email` and take the `set-auth-token` header, then `HOTCODEPUSH_API_BASE_URL=http://localhost:8787 HOTCODEPUSH_API_TOKEN=<bearer> npx vitest run src/integration.test.ts`.

## Naming

- A name says what the function does on first read: the verb, the object and, where it matters, the qualifier.
- Prefixes: `fetch` for HTTP, `resolve` for derivations without I/O.
- Result variables carry the past participle of their operation: `fetchedChannel`, `resolvedError`.
- Alphabetical ordering within a scope: imports, object keys, interface members, declarations of one kind.
- Booleans carry `is` or `has`; a state with a moment is a timestamp such as `pausedAt`, never a boolean.
- Error codes are `E_` plus SCREAMING_SNAKE, passed through verbatim, never renamed.
- Never the non-null assertion; nullish coalescing or a real check.
- Test titles read `should <verb> …`, lowercase, conditions starting with `when`; one test per request and branch.

## Releases

Nothing is on npm yet: CI's `preview` job publishes every pull request and every push to `main` to pkg.pr.new, with no secret, since the pkg.pr.new GitHub App authenticates.
Consumers install `https://pkg.pr.new/hotcodepush-team/hotcodepush-node/@hotcodepush/node@<sha>`, pinning a commit and bumping it deliberately, never `@main`.
The version stays `0.0.0`; release-please and the npm publish arrive with the publish decision.
Commits are conventional commits, since release-please will read them; `main` is trunk and CI is the gate.

## Agent workspace

- No `.mcp.json` yet: the one server this repo's stack takes is HotCodePush's own, `https://mcp.hotcodepush.com/mcp`, which does not exist yet; it joins the day it does.
- `.claude/skills/` holds the developer skills copied from `hotcodepush-team/.github` with the skills CLI and pinned in `skills-lock.json`; update them with `npx skills update`.
- `.github/copilot-instructions.md` holds the review criteria, the only Copilot-specific file.
