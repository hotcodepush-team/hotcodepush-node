import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const SHA256 = 'a'.repeat(64);

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
});
