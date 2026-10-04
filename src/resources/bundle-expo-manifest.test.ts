import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const SIGNATURE = { keyId: 'key', value: 'rsa-v1_5-sha256:c2ln' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleExpoManifestResource', () => {
  test('should put the manifest and its signature for the platform', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.bundles.expoManifest.upload({
      appId: 'app',
      bundleId: 'bundle',
      manifest: '{}',
      platform: 'ios',
      signature: SIGNATURE,
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { manifest: '{}', signature: SIGNATURE },
      method: 'PUT',
      url: 'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/expo/ios/manifest',
    });
  });

  test('should retry the upload when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.bundles.expoManifest.upload({
        appId: 'app',
        bundleId: 'bundle',
        manifest: '{}',
        platform: 'android',
        signature: null,
      }),
    );

    expect(attemptCount).toBe(3);
  });
});
