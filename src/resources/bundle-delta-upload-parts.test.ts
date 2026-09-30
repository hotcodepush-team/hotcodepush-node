import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleDeltaUploadPartsResource', () => {
  test('should put the part as a tar under its number', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ etag: 'etag', partNumber: 2 }),
    );
    const part = new Blob(['part bytes']);

    const uploadedPart =
      await new HotCodePush().apps.bundles.deltas.uploads.parts.upload({
        appId: 'app',
        baseBundleId: 'base',
        body: part,
        bundleId: 'bundle',
        partNumber: 2,
        uploadId: 'upload',
      });

    expect(uploadedPart).toEqual({ etag: 'etag', partNumber: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: part,
      headers: { 'Content-Type': 'application/x-tar' },
      method: 'PUT',
      url: 'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/deltas/base/uploads/upload/parts/2',
    });
  });
});
