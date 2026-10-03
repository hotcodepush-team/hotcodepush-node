import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const BINARIES_URL = 'https://api.hotcodepush.com/v1/apps/app/binaries';
const BINARY = { bundleId: 'bundle', deviceCount: 3, id: 'binary' };
const FILE = { path: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 5 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BinariesResource', () => {
  test('should count the binaries of the app', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().apps.binaries.count({
      appId: 'app',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BINARIES_URL}/count`,
    });
  });

  test('should post the binary identity with force and its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(BINARY, { status: 201 }));

    const createdBinary = await new HotCodePush().apps.binaries.create({
      appId: 'app',
      binaryBuild: '42',
      binaryVersion: '1.0.0',
      files: [FILE],
      force: true,
      idempotencyKey: 'key',
      platform: 'android',
    });

    expect(createdBinary).toEqual(BINARY);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        binaryBuild: '42',
        binaryVersion: '1.0.0',
        files: [FILE],
        force: true,
        platform: 'android',
      },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: BINARIES_URL,
    });
  });

  test('should get the binary with its bundle', async () => {
    const fetchMock = stubFetch(() => Response.json(BINARY));

    const fetchedBinary = await new HotCodePush().apps.binaries.get({
      appId: 'app',
      binaryId: 'binary',
      relations: ['bundle'],
    });

    expect(fetchedBinary).toEqual(BINARY);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BINARIES_URL}/binary?relations=bundle`,
    });
  });

  test('should list the binaries of the app', async () => {
    const fetchMock = stubFetch(() => Response.json([BINARY]));

    const fetchedBinaries = await new HotCodePush().apps.binaries.list({
      appId: 'app',
      limit: 20,
    });

    expect(fetchedBinaries).toEqual([BINARY]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BINARIES_URL}?limit=20`,
    });
  });
});
