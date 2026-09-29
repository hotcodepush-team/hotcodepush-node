import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundlePackResource', () => {
  test('should put the pack as a tar', async () => {
    const fetchMock = stubFetch(() => Response.json({ sizeBytes: 9 }));
    const pack = new Blob(['tar bytes']);

    const uploadedPack = await new HotCodePush().apps.bundles.pack.upload({
      appId: 'app',
      body: pack,
      bundleId: 'bundle',
    });

    expect(uploadedPack).toEqual({ sizeBytes: 9 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: pack,
      headers: { 'Content-Type': 'application/x-tar' },
      method: 'PUT',
      url: 'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/pack',
    });
  });
});
