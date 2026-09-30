import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const UPLOADS_URL =
  'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/pack/uploads';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundlePackUploadsResource', () => {
  test('should post the parts to complete the upload', async () => {
    const fetchMock = stubFetch(() => Response.json({ sizeBytes: 9 }));

    const completedPack =
      await new HotCodePush().apps.bundles.pack.uploads.complete({
        appId: 'app',
        bundleId: 'bundle',
        parts: [{ etag: 'etag', partNumber: 1 }],
        uploadId: 'upload',
      });

    expect(completedPack).toEqual({ sizeBytes: 9 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { parts: [{ etag: 'etag', partNumber: 1 }] },
      method: 'POST',
      url: `${UPLOADS_URL}/upload/complete`,
    });
  });

  test('should not retry the completion when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.bundles.pack.uploads.complete({
        appId: 'app',
        bundleId: 'bundle',
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

    const createdUpload =
      await new HotCodePush().apps.bundles.pack.uploads.create({
        appId: 'app',
        bundleId: 'bundle',
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
      new HotCodePush().apps.bundles.pack.uploads.create({
        appId: 'app',
        bundleId: 'bundle',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should delete the upload to abort it', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.bundles.pack.uploads.delete({
      appId: 'app',
      bundleId: 'bundle',
      uploadId: 'upload',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${UPLOADS_URL}/upload`,
    });
  });
});
