import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  resolveSentMethodsAndUrls,
  resolveSentRequest,
  stubFetch,
  stubMultipartUploadFetch,
} from '../test-helpers';
import { SINGLE_UPLOAD_LIMIT_BYTES } from '../upload-in-parts';

const BLOB_ABOVE_SINGLE_UPLOAD_LIMIT = new Blob([
  new Uint8Array(SINGLE_UPLOAD_LIMIT_BYTES + 1),
]);
const PACK_URL = 'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/pack';
const PART_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

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

  test('should put a blob at the single-upload limit in one request', async () => {
    const fetchMock = stubFetch(() => Response.json({ sizeBytes: 9 }));

    await new HotCodePush().apps.bundles.pack.upload({
      appId: 'app',
      bundleId: 'bundle',
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT.slice(0, SINGLE_UPLOAD_LIMIT_BYTES),
    });

    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([`PUT ${PACK_URL}`]);
  });

  test('should upload a blob above the single-upload limit in parts and complete it', async () => {
    const completedBody = { sizeBytes: 9 };
    const fetchMock = stubMultipartUploadFetch(completedBody);

    const uploadedBody = await new HotCodePush().apps.bundles.pack.upload({
      appId: 'app',
      bundleId: 'bundle',
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT,
    });

    expect(uploadedBody).toEqual(completedBody);
    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([
      `POST ${PACK_URL}/uploads`,
      ...PART_NUMBERS.map(
        partNumber => `PUT ${PACK_URL}/uploads/upload/parts/${partNumber}`,
      ),
      `POST ${PACK_URL}/uploads/upload/complete`,
    ]);
  });
});
