import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const EMBEDDED_BUNDLES_URL =
  'https://api.hotcodepush.com/v1/apps/app/embedded-bundles';
const EMBEDDED_BUNDLE = { bundleId: 'bundle', id: 'embedded-bundle' };
const FILE = { path: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 5 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('EmbeddedBundlesResource', () => {
  test('should post the binary identity with force and its idempotency key', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(EMBEDDED_BUNDLE, { status: 201 }),
    );

    const createdEmbeddedBundle =
      await new HotCodePush().apps.embeddedBundles.create({
        appId: 'app',
        binaryBuild: '42',
        binaryVersion: '1.0.0',
        files: [FILE],
        force: true,
        idempotencyKey: 'key',
        platform: 'android',
      });

    expect(createdEmbeddedBundle).toEqual(EMBEDDED_BUNDLE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        binaryBuild: '42',
        binaryVersion: '1.0.0',
        files: [FILE],
        force: true,
        platform: 'android',
      },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: EMBEDDED_BUNDLES_URL,
    });
  });

  test('should get the embedded bundle with its bundle', async () => {
    const fetchMock = stubFetch(() => Response.json(EMBEDDED_BUNDLE));

    const fetchedEmbeddedBundle =
      await new HotCodePush().apps.embeddedBundles.get({
        appId: 'app',
        embeddedBundleId: 'embedded-bundle',
        relations: ['bundle'],
      });

    expect(fetchedEmbeddedBundle).toEqual(EMBEDDED_BUNDLE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${EMBEDDED_BUNDLES_URL}/embedded-bundle?relations=bundle`,
    });
  });

  test('should list the embedded bundles of the app', async () => {
    const fetchMock = stubFetch(() => Response.json([EMBEDDED_BUNDLE]));

    const fetchedEmbeddedBundles =
      await new HotCodePush().apps.embeddedBundles.list({
        appId: 'app',
        limit: 20,
      });

    expect(fetchedEmbeddedBundles).toEqual([EMBEDDED_BUNDLE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${EMBEDDED_BUNDLES_URL}?limit=20`,
    });
  });
});
