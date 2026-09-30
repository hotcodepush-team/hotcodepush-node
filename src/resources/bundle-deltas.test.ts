import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  resolveSentMethodsAndUrls,
  resolveSentRequest,
  stubFetch,
  stubMultipartUploadFetch,
} from '../test-helpers';
import { PART_SIZE_BYTES, SINGLE_UPLOAD_LIMIT_BYTES } from '../upload-in-parts';

const BLOB_ABOVE_SINGLE_UPLOAD_LIMIT = new Blob([
  new Uint8Array(SINGLE_UPLOAD_LIMIT_BYTES + 1),
]);
const DELTA_URL =
  'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/deltas/base';
const PART_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

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

  test('should put a blob at the single-upload limit in one request', async () => {
    const fetchMock = stubFetch(() => Response.json({ sizeBytes: 5 }));

    await new HotCodePush().apps.bundles.deltas.upload({
      appId: 'app',
      baseBundleId: 'base',
      bundleId: 'bundle',
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT.slice(0, SINGLE_UPLOAD_LIMIT_BYTES),
    });

    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([`PUT ${DELTA_URL}`]);
  });

  test('should upload a blob above the single-upload limit in parts of one size and complete it', async () => {
    const completedBody = { sizeBytes: 5 };
    const fetchMock = stubMultipartUploadFetch(completedBody);

    const uploadedBody = await new HotCodePush().apps.bundles.deltas.upload({
      appId: 'app',
      baseBundleId: 'base',
      bundleId: 'bundle',
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT,
    });

    expect(uploadedBody).toEqual(completedBody);
    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([
      `POST ${DELTA_URL}/uploads`,
      ...PART_NUMBERS.map(
        partNumber => `PUT ${DELTA_URL}/uploads/upload/parts/${partNumber}`,
      ),
      `POST ${DELTA_URL}/uploads/upload/complete`,
    ]);
    expect(
      fetchMock.mock.calls
        .slice(1, -1)
        .map(([, init]) => (init?.body as Blob).size),
    ).toEqual([
      ...Array<number>(6).fill(PART_SIZE_BYTES),
      SINGLE_UPLOAD_LIMIT_BYTES + 1 - 6 * PART_SIZE_BYTES,
    ]);
    expect(resolveSentRequest(fetchMock).body).toEqual({
      parts: PART_NUMBERS.map(partNumber => ({
        etag: `etag-${partNumber}`,
        partNumber,
      })),
    });
  });

  test('should delete the upload and rethrow the error when a part fails', async () => {
    const fetchMock = stubMultipartUploadFetch({}, 2);

    const uploadPromise = new HotCodePush().apps.bundles.deltas.upload({
      appId: 'app',
      baseBundleId: 'base',
      bundleId: 'bundle',
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT,
    });

    await expect(uploadPromise).rejects.toMatchObject({
      code: 'E_UPLOAD_INCOMPLETE',
      status: 409,
    });
    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([
      `POST ${DELTA_URL}/uploads`,
      `PUT ${DELTA_URL}/uploads/upload/parts/1`,
      `PUT ${DELTA_URL}/uploads/upload/parts/2`,
      `DELETE ${DELTA_URL}/uploads/upload`,
    ]);
  });
});
