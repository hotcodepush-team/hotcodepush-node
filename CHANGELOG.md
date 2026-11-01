# Changelog

## [0.1.0](https://github.com/hotcodepush-team/hotcodepush-node/compare/v0.0.1...v0.1.0) (2026-11-01)


### ⚠ BREAKING CHANGES

* release conditions carry raw attribute values and device ids ([#27](https://github.com/hotcodepush-team/hotcodepush-node/issues/27))
* the API after the contract audit, one release list, qr-code, the renames, and the client alignments ([#25](https://github.com/hotcodepush-team/hotcodepush-node/issues/25))
* `HotCodePushErrorCode` is the lowercase catalog, `forbidden` in place of `E_FORBIDDEN` and so on, and the client's own `E_UNEXPECTED_RESPONSE` is `unexpected_response`; every `framework` field (`App`, `Bundle`, the create and update options, `Release.bundle`, `BundleDelta.baseBundle`) takes `react_native` in place of `react-native`; `Audience.warnings[].code` and `ReleaseAudience.warnings[].code` are `fingerprint_unknown | unsupported_condition_share`. The API answers the new spellings to every client version, so a comparison against `'E_NOT_FOUND'` never matches again, whichever client you pin.
* `apps.channels.indexes`, `ChannelIndex` and `GetChannelIndexOptions` are removed; `Channel` loses `indexSequence`, `verificationResult` and `verifiedAt`; `ReleaseDeviceEvent.type` is `applied | checked | confirmed | failed` in place of `applied | attempted | checked | failed`; on `releaseCounters` `attemptedUpdateCount` is `appliedUpdateCount` and the old `appliedUpdateCount` is `confirmedUpdateCount`; a statistics day's and an adoption point's `appliedUpdateCount` is `confirmedUpdateCount`; `stepStartAttemptedUpdateCount` is `stepStartAppliedUpdateCount` and `windowStartAttemptedUpdateCount` is `windowStartAppliedUpdateCount`; `HotCodePushErrorCode` loses `E_TURNSTILE_FAILED`.
* the billing and delta upload routes go, and the rows serve their counters
* the resources are their rows, the aggregates live in the fleet statistics
* users.delete requires password, and the error code E_SOLE_SIGNING_KEY is gone.
* counters.installed, days[].installed and adoption[].installed are applied, the mark kind installed is applied and the warning code FINGERPRINT_UNREGISTERED is FINGERPRINT_UNKNOWN.
* the audit log, bulk deletes and a first password, deployment keys and the Expo manifest gone, and the snapshot resynced
* apps.patches leaves with the API's patch store

### Features

* a bundle's files and their count, the fingerprint filter on bundles and binaries and the platform filter on binaries ([bcf0045](https://github.com/hotcodepush-team/hotcodepush-node/commit/bcf0045bdcd77a06d511e1d04f1c6f6136d60973))
* a signing key is an rsa-v1_5-sha256 key of at least 2048 bits, and the snapshot resynced ([7cb5abb](https://github.com/hotcodepush-team/hotcodepush-node/commit/7cb5abb9ff6ccd822edfada09426b0a5a0264da0))
* a userAgent option, sent as User-Agent only when set ([32a91d6](https://github.com/hotcodepush-team/hotcodepush-node/commit/32a91d6e478c2152548efdb86b63217f0ef890d0))
* add the HotCodePush client with the health resource ([389a3df](https://github.com/hotcodepush-team/hotcodepush-node/commit/389a3df479a194c309b181ed3b6dbef2f1ba2bdb))
* apps.patches leaves with the API's patch store ([77d9e4e](https://github.com/hotcodepush-team/hotcodepush-node/commit/77d9e4e8718e96ea9315abafc81fb9f5291e6930))
* apps.update takes the framework ([9816d51](https://github.com/hotcodepush-team/hotcodepush-node/commit/9816d516df0f7889dbfb760a24f32cae9d2dcfbc)), closes [#2](https://github.com/hotcodepush-team/hotcodepush-node/issues/2)
* binaries in place of embeddedBundles; devices, signing keys, the audience, the fleet statistics and patch uploads ([2d60084](https://github.com/hotcodepush-team/hotcodepush-node/commit/2d60084515ddd6a942c0986f748b9273007f54bf)), closes [#12](https://github.com/hotcodepush-team/hotcodepush-node/issues/12)
* bundles, files and uploads, embedded bundles ([c760b36](https://github.com/hotcodepush-team/hotcodepush-node/commit/c760b36f490975e7b1e21eb43b28ffef849c4bbc)), closes [#2](https://github.com/hotcodepush-team/hotcodepush-node/issues/2)
* count() on every paginated list, and the OpenAPI snapshot resynced ([f7ba944](https://github.com/hotcodepush-team/hotcodepush-node/commit/f7ba944bb581b6dea6225d43d2c15484f3ba8137)), closes [#11](https://github.com/hotcodepush-team/hotcodepush-node/issues/11)
* every catalog value the client knows is lowercase snake_case ([934eb88](https://github.com/hotcodepush-team/hotcodepush-node/commit/934eb8853bc8ea75afd94d2370d7efc70372f541))
* list a device's marks and a bundle's delta packs ([7021160](https://github.com/hotcodepush-team/hotcodepush-node/commit/70211601e8d0effc3e827fec35b9b159cb9c996b))
* multipart pack and delta uploads, and the user's isEmailVerified ([47c3d76](https://github.com/hotcodepush-team/hotcodepush-node/commit/47c3d76c17d692a793c0373df49e85a51e6c202c)), closes [#2](https://github.com/hotcodepush-team/hotcodepush-node/issues/2)
* read an organization's usage per app as a list ([5d7eeae](https://github.com/hotcodepush-team/hotcodepush-node/commit/5d7eeae7bda1e9fb011a7eabb9a6b29a2c7ad54c))
* release conditions carry raw attribute values and device ids ([#27](https://github.com/hotcodepush-team/hotcodepush-node/issues/27)) ([3ac4122](https://github.com/hotcodepush-team/hotcodepush-node/commit/3ac4122cfac2da123ce16709e41f0d31d4b80381))
* send queries, idempotency keys and snapshot-typed paths from the HTTP client ([44308b6](https://github.com/hotcodepush-team/hotcodepush-node/commit/44308b6d10c06d561bbf6a7f0d22ab8c86c36463))
* the API after the contract audit, one release list, qr-code, the renames, and the client alignments ([#25](https://github.com/hotcodepush-team/hotcodepush-node/issues/25)) ([3146611](https://github.com/hotcodepush-team/hotcodepush-node/commit/31466110eac3d42e5e5f7743a15c80dfa9ed7849))
* the audit log, bulk deletes and a first password, deployment keys and the Expo manifest gone, and the snapshot resynced ([323fdaf](https://github.com/hotcodepush-team/hotcodepush-node/commit/323fdafe36a8953e549393a84da45e1bde8cc81d))
* the auto-pause action none ([a3c78bc](https://github.com/hotcodepush-team/hotcodepush-node/commit/a3c78bca4e7b4e19609c1034b9bee6a9e3651eab))
* the billing and delta upload routes go, and the rows serve their counters ([36c271a](https://github.com/hotcodepush-team/hotcodepush-node/commit/36c271a4cb1aed2cff094cd7602f01e0463dee0a))
* the bulk revocation, the release audience, the update and usage statistics, and the created release's warnings ([44c9ecc](https://github.com/hotcodepush-team/hotcodepush-node/commit/44c9ecc2af83f34ed36c502f3f3ce4d28db1403a)), closes [#13](https://github.com/hotcodepush-team/hotcodepush-node/issues/13)
* the bundle read carries deltaPacks, Bundle split from the read's type ([b41467f](https://github.com/hotcodepush-team/hotcodepush-node/commit/b41467f57072048b1ceab390afabb482f8a72165)), closes [#20](https://github.com/hotcodepush-team/hotcodepush-node/issues/20)
* the bundle read carries deltaPacks, Bundle split from the read's type ([4d1d8f9](https://github.com/hotcodepush-team/hotcodepush-node/commit/4d1d8f9d6de7c47e6991eeb998c0cf5cbb56e52f)), closes [#20](https://github.com/hotcodepush-team/hotcodepush-node/issues/20)
* the bundle read's delta packs carry the base's number ([85549d7](https://github.com/hotcodepush-team/hotcodepush-node/commit/85549d77269e2b2719162125f9fc432088eec4ed))
* the client follows the API's channel, index and update-vocabulary changes ([2d35eda](https://github.com/hotcodepush-team/hotcodepush-node/commit/2d35eda9db765e30d8ede618792c4c42e0d47111))
* the milestone-4 operations — billing, checkouts, the portal, cancel and uncancel, usage, limits, notifications and the release's progression ([ffffe3b](https://github.com/hotcodepush-team/hotcodepush-node/commit/ffffe3b4ecace280fed15bb8322a729ac3003dd4)), closes [#19](https://github.com/hotcodepush-team/hotcodepush-node/issues/19)
* the resources are their rows, the aggregates live in the fleet statistics ([4cda1d1](https://github.com/hotcodepush-team/hotcodepush-node/commit/4cda1d183897a04103251a19d3ed2833586c8ea0))
* the resources the API serves today, typed from the OpenAPI snapshot ([7bc8120](https://github.com/hotcodepush-team/hotcodepush-node/commit/7bc81204b8ac730787c8ec4e160a0f99033e2588))
* the SSO provider resource, and the contract test covers every documented operation ([02af566](https://github.com/hotcodepush-team/hotcodepush-node/commit/02af566e16361d230eef75a09301f30d0e875ca2)), closes [#9](https://github.com/hotcodepush-team/hotcodepush-node/issues/9)
* the update statistics take releaseId and answer each day's activeDevices, and the snapshot resynced ([bbd4511](https://github.com/hotcodepush-team/hotcodepush-node/commit/bbd451164b6c9a88f42f3d687ea5f2cb9e7aad5d))
* the webhook resources join the client ([6e40315](https://github.com/hotcodepush-team/hotcodepush-node/commit/6e403153b386fdcb9ec873eaeb12919b8599e9e2))
* upload goes up in parts above the single-upload limit, the limit exported ([6cbca22](https://github.com/hotcodepush-team/hotcodepush-node/commit/6cbca2264023583d6c04d92ff95ff5a6a25af160)), closes [#7](https://github.com/hotcodepush-team/hotcodepush-node/issues/7)
* users.delete takes the account's password ([610b02f](https://github.com/hotcodepush-team/hotcodepush-node/commit/610b02f9d17b7b825dd5b2804ef458239924399e))
* users.get for the caller behind a session or a token ([f85b1d0](https://github.com/hotcodepush-team/hotcodepush-node/commit/f85b1d02decb0b10d8655585f3207e4cee136dfb)), closes [#2](https://github.com/hotcodepush-team/hotcodepush-node/issues/2)
* version and build in place of bundleVersion, binaryVersion and binaryBuild, the bundle's type, deployment keys and the Expo manifest upload ([9972b17](https://github.com/hotcodepush-team/hotcodepush-node/commit/9972b17fd47e8eaf5193a726cccfd609821e1b96)), closes [#13](https://github.com/hotcodepush-team/hotcodepush-node/issues/13)


### Bug Fixes

* a 429 or a 503 waits its Retry-After, capped at sixty seconds, before the next attempt ([da34b10](https://github.com/hotcodepush-team/hotcodepush-node/commit/da34b10ee19e97ace0446a8851a79e31cfb3795e))
* a response outside the API's error shape is E_UNEXPECTED_RESPONSE ([865a529](https://github.com/hotcodepush-team/hotcodepush-node/commit/865a529e7a5262acb78566339edaec4d870ad4f8)), closes [#8](https://github.com/hotcodepush-team/hotcodepush-node/issues/8)
* binary uploads get a ten-minute timeout per attempt ([04b247e](https://github.com/hotcodepush-team/hotcodepush-node/commit/04b247e54bcc8f7cb31dee37e5642d9be12de581)), closes [#2](https://github.com/hotcodepush-team/hotcodepush-node/issues/2)
* health.get resolves on the API's plain-text ok ([9d86df5](https://github.com/hotcodepush-team/hotcodepush-node/commit/9d86df5e719f396467159deda8cd4d08a48861f1)), closes [#4](https://github.com/hotcodepush-team/hotcodepush-node/issues/4)
* relations and the error code derive from the snapshot ([e9361bd](https://github.com/hotcodepush-team/hotcodepush-node/commit/e9361bd0476c36c964d0847b3b1b134c25ceeef2)), closes [#6](https://github.com/hotcodepush-team/hotcodepush-node/issues/6)
* retry only the calls whose repeat the API makes safe ([555613e](https://github.com/hotcodepush-team/hotcodepush-node/commit/555613e8da0d73092986565cfe98896072bf2d95)), closes [#5](https://github.com/hotcodepush-team/hotcodepush-node/issues/5)
* retry the multipart starts and the file upload's completion ([77b2286](https://github.com/hotcodepush-team/hotcodepush-node/commit/77b22863be987e1df9891ccb41307d9a1c6708d8))
* signingKeys.create is retried, since a repeat answers the existing key ([88d7d65](https://github.com/hotcodepush-team/hotcodepush-node/commit/88d7d65ad40025f1823e31c49e2f3cff2680b2c2))
* write answers are typed as the bare rows the API serves ([ddde5fd](https://github.com/hotcodepush-team/hotcodepush-node/commit/ddde5fd4a754acbfa6d480497acc4ccbbe806b06))


### Code Refactoring

* the snapshot resynced, applied replaces installed and FINGERPRINT_UNKNOWN replaces FINGERPRINT_UNREGISTERED ([b78ce1c](https://github.com/hotcodepush-team/hotcodepush-node/commit/b78ce1c206d25fa667fdb122ed6a5dc1c98c48e0))
