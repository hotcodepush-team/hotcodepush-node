import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const SHA256 = 'a'.repeat(64);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FileUploadPartsResource', () => {
  test('should put the part under its number', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ etag: 'etag', partNumber: 2 }),
    );
    const part = new Blob(['part bytes']);

    const uploadedPart =
      await new HotCodePush().apps.files.uploads.parts.upload({
        appId: 'app',
        body: part,
        partNumber: 2,
        sha256: SHA256,
        uploadId: 'upload',
      });

    expect(uploadedPart).toEqual({ etag: 'etag', partNumber: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: part,
      headers: { 'Content-Type': 'application/gzip' },
      method: 'PUT',
      url: `https://api.hotcodepush.com/v1/apps/app/files/${SHA256}/uploads/upload/parts/2`,
    });
  });
});
