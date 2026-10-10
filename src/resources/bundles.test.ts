import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';
import type { BundleWithDeltaPacks } from './bundles';

const BUNDLES_URL = 'https://api.hotcodepush.com/v1/apps/app/bundles';
const BUNDLE = { id: 'bundle', state: 'uploading' };
const DELTA_PACK: BundleWithDeltaPacks['deltaPacks'][number] = {
  baseBundleId: 'base',
  patchCount: 2,
  sizeBytes: 512,
  state: 'built',
};
const FILE = { path: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 5 };
const FINGERPRINT = `fp1:${'a'.repeat(64)}`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundlesResource', () => {
  test('should post to complete the bundle', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ ...BUNDLE, state: 'ready' }),
    );

    const completedBundle = await new HotCodePush().apps.bundles.complete({
      appId: 'app',
      bundleId: 'bundle',
    });

    expect(completedBundle).toEqual({ ...BUNDLE, state: 'ready' });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${BUNDLES_URL}/bundle/complete`,
    });
  });

  test('should retry the completion when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.bundles.complete({
        appId: 'app',
        bundleId: 'bundle',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should count the bundles of the app filtered by use and platform', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().apps.bundles.count({
      appId: 'app',
      isInUse: 'true',
      platform: 'ios',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLES_URL}/count?isInUse=true&platform=ios`,
    });
  });

  test('should post the manifest with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(BUNDLE, { status: 201 }));

    const createdBundle = await new HotCodePush().apps.bundles.create({
      appId: 'app',
      files: [FILE],
      idempotencyKey: 'key',
      platforms: ['android', 'ios'],
      version: '1.0.0',
    });

    expect(createdBundle).toEqual(BUNDLE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        files: [FILE],
        platforms: ['android', 'ios'],
        version: '1.0.0',
      },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: BUNDLES_URL,
    });
  });

  test('should delete the bundle', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.bundles.delete({
      appId: 'app',
      bundleId: 'bundle',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${BUNDLES_URL}/bundle`,
    });
  });

  test('should get the bundle with its delta packs', async () => {
    const bundle = { ...BUNDLE, deltaPacks: [DELTA_PACK] };
    const fetchMock = stubFetch(() => Response.json(bundle));

    const fetchedBundle = await new HotCodePush().apps.bundles.get({
      appId: 'app',
      bundleId: 'bundle',
    });

    expect(fetchedBundle).toEqual(bundle);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLES_URL}/bundle`,
    });
  });

  test('should list the bundles of the app filtered by fingerprint, use, platform and type', async () => {
    const fetchMock = stubFetch(() => Response.json([BUNDLE]));

    const fetchedBundles = await new HotCodePush().apps.bundles.list({
      appId: 'app',
      fingerprint: FINGERPRINT,
      isInUse: 'false',
      platform: 'ios',
      type: 'uploaded',
    });

    expect(fetchedBundles).toEqual([BUNDLE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLES_URL}?fingerprint=${encodeURIComponent(FINGERPRINT)}&isInUse=false&platform=ios&type=uploaded`,
    });
  });
});
