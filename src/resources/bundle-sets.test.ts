import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const BUNDLE_SET = { bundleIds: ['bundle'], id: 'bundle-set', number: 1 };
const BUNDLE_SETS_URL = 'https://api.hotcodepush.com/v1/apps/app/bundle-sets';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleSetsResource', () => {
  test('should count the bundle sets of the app filtered by platform', async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 1 }));

    const fetchedCount = await new HotCodePush().apps.bundleSets.count({
      appId: 'app',
      platform: 'ios',
    });

    expect(fetchedCount).toEqual({ count: 1 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLE_SETS_URL}/count?platform=ios`,
    });
  });

  test('should post the bundle ids of the set', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(BUNDLE_SET, { status: 201 }),
    );

    const createdBundleSet = await new HotCodePush().apps.bundleSets.create({
      appId: 'app',
      bundleIds: ['bundle'],
    });

    expect(createdBundleSet).toEqual(BUNDLE_SET);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { bundleIds: ['bundle'] },
      method: 'POST',
      url: BUNDLE_SETS_URL,
    });
  });

  test('should retry the creation when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.bundleSets.create({
        appId: 'app',
        bundleIds: ['bundle'],
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should get the bundle set with its bundles', async () => {
    const fetchMock = stubFetch(() => Response.json(BUNDLE_SET));

    const fetchedBundleSet = await new HotCodePush().apps.bundleSets.get({
      appId: 'app',
      bundleSetId: 'bundle-set',
      relations: ['bundles'],
    });

    expect(fetchedBundleSet).toEqual(BUNDLE_SET);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLE_SETS_URL}/bundle-set?relations=bundles`,
    });
  });

  test('should list the bundle sets of the app that carry the bundle', async () => {
    const fetchMock = stubFetch(() => Response.json([BUNDLE_SET]));

    const fetchedBundleSets = await new HotCodePush().apps.bundleSets.list({
      appId: 'app',
      bundleId: 'bundle',
      limit: 20,
    });

    expect(fetchedBundleSets).toEqual([BUNDLE_SET]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BUNDLE_SETS_URL}?bundleId=bundle&limit=20`,
    });
  });
});
