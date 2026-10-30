import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const DELTAS_URL =
  'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/deltas';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleDeltasResource', () => {
  test("should count the bundle's deltas", async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 2 }));

    const fetchedCount = await new HotCodePush().apps.bundles.deltas.count({
      appId: 'app',
      bundleId: 'bundle',
    });

    expect(fetchedCount).toEqual({ count: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DELTAS_URL}/count`,
    });
  });

  test("should list the bundle's deltas with their base bundles", async () => {
    const delta = {
      baseBundle: { id: 'base', number: 16 },
      baseBundleId: 'base',
      status: 'built',
    };
    const fetchMock = stubFetch(() => Response.json([delta]));

    const fetchedDeltas = await new HotCodePush().apps.bundles.deltas.list({
      appId: 'app',
      bundleId: 'bundle',
      relations: ['baseBundle'],
    });

    expect(fetchedDeltas).toEqual([delta]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DELTAS_URL}?relations=baseBundle`,
    });
  });
});
