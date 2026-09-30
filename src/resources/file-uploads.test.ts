import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const SHA256 = 'a'.repeat(64);
const UPLOADS_URL = `https://api.hotcodepush.com/v1/apps/app/files/${SHA256}/uploads`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FileUploadsResource', () => {
  test('should post the parts to complete the upload', async () => {
    const file = { sha256: SHA256, sizeBytes: 10 };
    const fetchMock = stubFetch(() => Response.json(file, { status: 201 }));

    const completedFile = await new HotCodePush().apps.files.uploads.complete({
      appId: 'app',
      parts: [{ etag: 'etag', partNumber: 1 }],
      sha256: SHA256,
      uploadId: 'upload',
    });

    expect(completedFile).toEqual(file);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { parts: [{ etag: 'etag', partNumber: 1 }] },
      method: 'POST',
      url: `${UPLOADS_URL}/upload/complete`,
    });
  });

  test('should not retry the completion when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.files.uploads.complete({
        appId: 'app',
        sha256: SHA256,
        parts: [{ etag: 'etag', partNumber: 1 }],
        uploadId: 'upload',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should post to start the upload without an idempotency key', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ uploadId: 'upload' }, { status: 201 }),
    );

    const createdUpload = await new HotCodePush().apps.files.uploads.create({
      appId: 'app',
      sha256: SHA256,
    });

    expect(createdUpload).toEqual({ uploadId: 'upload' });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: UPLOADS_URL,
    });
    expect(resolveSentRequest(fetchMock).headers).not.toHaveProperty(
      'Idempotency-Key',
    );
  });

  test('should not retry the start when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.files.uploads.create({
        appId: 'app',
        sha256: SHA256,
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should delete the upload to abort it', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.files.uploads.delete({
      appId: 'app',
      sha256: SHA256,
      uploadId: 'upload',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${UPLOADS_URL}/upload`,
    });
  });
});
