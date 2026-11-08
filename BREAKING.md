# Breaking Changes

This is a comprehensive list of the breaking changes introduced in the minor version releases while the client is on `0.x`.

## Versions

- [Version 0.2.x](#version-02x)

## Version 0.2.x

### Flat Signature Fields

`apps.bundles.create` takes the signature as two fields, `signature` and `signatureKeyId`, instead of one `signature` object:

```diff
  await client.apps.bundles.create({
    appId,
-   signature: { keyId, value },
+   signature: value,
+   signatureKeyId: keyId,
    ...manifest,
  });
```

### Renamed `isInUse` Filter

`apps.bundles.list` and `apps.bundles.count` take `isUnused` instead of `isInUse`, with the opposite meaning. `isUnused: true` lists the bundles no release and no binary uses, the ones retention will expire:

```diff
- await client.apps.bundles.list({ appId, isInUse: false });
+ await client.apps.bundles.list({ appId, isUnused: true });
```

### Removed `source` Filter

`apps.bundles.list` and `apps.bundles.count` no longer take `source`. The list holds the uploaded bundles. The bundle a binary ships is read through the binary with `relations: ['bundle']`.

### Minimum Version

The API refuses versions below **0.2.0** with `client_update_required`. Update the client before the next call.
