import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const FROM_SHA256 = 'a'.repeat(64);
const TO_SHA256 = 'b'.repeat(64);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PatchesResource', () => {
  test('should put the patch bytes between the two contents', async () => {
    const patch = {
      fromSha256: FROM_SHA256,
      sizeBytes: 5,
      toSha256: TO_SHA256,
    };
    const fetchMock = stubFetch(() => Response.json(patch, { status: 201 }));
    const body = new Blob(['patch']);

    const uploadedPatch = await new HotCodePush().apps.patches.upload({
      appId: 'app',
      body,
      fromSha256: FROM_SHA256,
      toSha256: TO_SHA256,
    });

    expect(uploadedPatch).toEqual(patch);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      headers: {
        'Content-Length': '5',
        'Content-Type': 'application/octet-stream',
      },
      method: 'PUT',
      url: `https://api.hotcodepush.com/v1/apps/app/patches/${FROM_SHA256}/${TO_SHA256}`,
    });
  });
});
