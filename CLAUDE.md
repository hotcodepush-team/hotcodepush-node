# CLAUDE.md

`@hotcodepush/node`, the typed Node client for the HotCodePush REST API, modeled on Capawesome's [`cloud-node`](https://github.com/capawesome-team/cloud-node).
The CLI and the MCP server depend on it like any customer does, so the API contract is dogfooded through this package.
Stack: TypeScript, tsdown for the build (ESM plus types), Vitest; no runtime dependency.

The API contract is planned in the private `handbook` repo, checked out beside this one by maintainers: `../handbook/docs/api.md`, its Conventions and Errors sections above all.
When the code and the contract disagree, stop and surface it; never improvise.
The client is validated against the API's OpenAPI document; the check arrives with issue #2.

## Layout

```
src/index.ts         the public exports
src/client.ts        HotCodePush: the options and one property per resource
src/http-client.ts   the one place that calls fetch: the headers, withTimeout, withRetry, JSON in and out
src/errors.ts        HotCodePushError and the parsing of the one error shape
src/types.ts         the shapes every resource shares
src/resources/       one file per API resource, its types beside it
```

Tests live beside the code they test, `*.test.ts` next to the file, and stub the global `fetch`; nothing calls the real API.

## Commands

| Command             | Does                                                                        |
| ------------------- | --------------------------------------------------------------------------- |
| `npm run build`     | tsdown into `dist/`; `prepare` runs it, so a git install builds the package |
| `npm run lint`      | ESLint and Prettier's check                                                 |
| `npm run fmt`       | ESLint's fixes and Prettier                                                 |
| `npm test`          | Vitest                                                                      |
| `npm run typecheck` | `tsc --noEmit`                                                              |

Run `npm run fmt` before every commit; lint, typecheck, test and build must pass, and CI runs the four on every pull request and push to `main`.
`.prettierignore` keeps the files copied from the monorepo and `.github` verbatim.

## The API contract

- Auth is `Authorization: Bearer <token>`; the token is optional, since `/health` needs none.
- Every request sends `X-HotCodePush-Client: <name>/<version>`, `node/<this package's version>` unless the caller passes its own, as the CLI and the MCP server do.
- Every error is one JSON shape, `code`, `message`, `details`; `HotCodePushError` carries them and the status verbatim, and a body without the shape becomes `E_INTERNAL`.
- Every call goes through `withTimeout` and `withRetry`, never a bare `fetch`: sixty seconds per attempt, three attempts, exponential backoff from 500 ms, retrying a thrown fetch, 408, 429 and 5xx.
- Arriving with issue #2: `Idempotency-Key` on creating `POST`s, `limit` and `offset`, `?relations=`, streaming upload bodies.

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

Nothing is published yet: consumers install `github:hotcodepush-team/hotcodepush-node#main`, built by `prepare` and pinned by their lockfile.
The version stays `0.0.0`; release-please, the npm publish and the pkg.pr.new previews arrive with the publish decision.
Commits are conventional commits, since release-please will read them; `main` is trunk and CI is the gate.

## Agent workspace

- No `.mcp.json` yet: the one server this repo's stack takes is HotCodePush's own, `https://mcp.hotcodepush.com/mcp`, which does not exist yet; it joins the day it does.
- `.claude/skills/` holds the developer skills copied from `hotcodepush-team/.github` with the skills CLI and pinned in `skills-lock.json`; update them with `npx skills update`.
- `.github/copilot-instructions.md` holds the review criteria, the only Copilot-specific file.
