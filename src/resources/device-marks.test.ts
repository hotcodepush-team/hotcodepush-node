import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const MARK = { kind: 'applied', releaseId: 'release' };
const MARKS_URL =
  'https://api.hotcodepush.com/v1/apps/app/devices/device/marks';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DeviceMarksResource', () => {
  test("should count the device's marks of the release", async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 2 }));

    const fetchedCount = await new HotCodePush().apps.devices.marks.count({
      appId: 'app',
      deviceId: 'device',
      releaseId: 'release',
    });

    expect(fetchedCount).toEqual({ total: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${MARKS_URL}/count?releaseId=release`,
    });
  });

  test("should list a page of the device's marks", async () => {
    const fetchMock = stubFetch(() => Response.json([MARK]));

    const fetchedMarks = await new HotCodePush().apps.devices.marks.list({
      appId: 'app',
      deviceId: 'device',
      limit: 100,
      offset: 100,
    });

    expect(fetchedMarks).toEqual([MARK]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${MARKS_URL}?limit=100&offset=100`,
    });
  });
});
