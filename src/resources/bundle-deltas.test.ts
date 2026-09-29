import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleDeltasResource', () => {
  test('should put the delta pack from the base bundle as a tar', async () => {
    const fetchMock = stubFetch(() => Response.json({ sizeBytes: 5 }));
    const delta = new Blob(['delta']);

    const uploadedDelta = await new HotCodePush().apps.bundles.deltas.upload({
      appId: 'app',
      baseBundleId: 'base',
      body: delta,
      bundleId: 'bundle',
    });

    expect(uploadedDelta).toEqual({ sizeBytes: 5 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: delta,
      headers: { 'Content-Type': 'application/x-tar' },
      method: 'PUT',
      url: 'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/deltas/base',
    });
  });
});
