import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const FILE = { path: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 5 };
const FILES_URL =
  'https://api.hotcodepush.com/v1/apps/app/bundles/bundle/files';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BundleFilesResource', () => {
  test('should count the files of the bundle', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().apps.bundles.files.count({
      appId: 'app',
      bundleId: 'bundle',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${FILES_URL}/count`,
    });
  });

  test('should list a page of the files of the bundle', async () => {
    const fetchMock = stubFetch(() => Response.json([FILE]));

    const fetchedFiles = await new HotCodePush().apps.bundles.files.list({
      appId: 'app',
      bundleId: 'bundle',
      limit: 100,
      offset: 100,
    });

    expect(fetchedFiles).toEqual([FILE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${FILES_URL}?limit=100&offset=100`,
    });
  });
});
