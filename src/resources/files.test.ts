import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  resolveSentMethodsAndUrls,
  resolveSentRequest,
  stubFetch,
  stubMultipartUploadFetch,
} from '../test-helpers';
import { PART_SIZE_BYTES, SINGLE_UPLOAD_LIMIT_BYTES } from '../upload-in-parts';

const SHA256 = 'a'.repeat(64);
const BLOB_ABOVE_SINGLE_UPLOAD_LIMIT = new Blob([
  new Uint8Array(SINGLE_UPLOAD_LIMIT_BYTES + 1),
]);
const FILE_URL = `https://api.hotcodepush.com/v1/apps/app/files/${SHA256}`;
const PART_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FilesResource', () => {
  test('should put the gzip stream of the file with its content length', async () => {
    const file = { sha256: SHA256, sizeBytes: 10 };
    const fetchMock = stubFetch(() => Response.json(file, { status: 201 }));
    const stream = new Blob(['gzip bytes']).stream();

    const uploadedFile = await new HotCodePush().apps.files.upload({
      appId: 'app',
      body: stream,
      contentLength: 10,
      sha256: SHA256,
    });

    expect(uploadedFile).toEqual(file);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: stream,
      headers: { 'Content-Length': '10', 'Content-Type': 'application/gzip' },
      method: 'PUT',
      url: `https://api.hotcodepush.com/v1/apps/app/files/${SHA256}`,
    });
  });

  test('should put a blob at the single-upload limit in one request', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ sha256: SHA256, sizeBytes: 10 }, { status: 201 }),
    );

    await new HotCodePush().apps.files.upload({
      appId: 'app',
      sha256: SHA256,
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT.slice(0, SINGLE_UPLOAD_LIMIT_BYTES),
    });

    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([`PUT ${FILE_URL}`]);
  });

  test('should upload a blob above the single-upload limit in parts of one size and complete it', async () => {
    const completedBody = { sha256: SHA256, sizeBytes: 10 };
    const fetchMock = stubMultipartUploadFetch(completedBody);

    const uploadedBody = await new HotCodePush().apps.files.upload({
      appId: 'app',
      sha256: SHA256,
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT,
    });

    expect(uploadedBody).toEqual(completedBody);
    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([
      `POST ${FILE_URL}/uploads`,
      ...PART_NUMBERS.map(
        partNumber => `PUT ${FILE_URL}/uploads/upload/parts/${partNumber}`,
      ),
      `POST ${FILE_URL}/uploads/upload/complete`,
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

    const uploadPromise = new HotCodePush().apps.files.upload({
      appId: 'app',
      sha256: SHA256,
      body: BLOB_ABOVE_SINGLE_UPLOAD_LIMIT,
    });

    await expect(uploadPromise).rejects.toMatchObject({
      code: 'E_UPLOAD_INCOMPLETE',
      status: 409,
    });
    expect(resolveSentMethodsAndUrls(fetchMock)).toEqual([
      `POST ${FILE_URL}/uploads`,
      `PUT ${FILE_URL}/uploads/upload/parts/1`,
      `PUT ${FILE_URL}/uploads/upload/parts/2`,
      `DELETE ${FILE_URL}/uploads/upload`,
    ]);
  });
});
