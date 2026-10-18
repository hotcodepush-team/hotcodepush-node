import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const EVENT = { releaseId: 'release', type: 'applied' };
const EVENTS_URL =
  'https://api.hotcodepush.com/v1/apps/app/devices/device/events';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DeviceEventsResource', () => {
  test("should count the device's events of the release", async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 2 }));

    const fetchedCount = await new HotCodePush().apps.devices.events.count({
      appId: 'app',
      deviceId: 'device',
      releaseId: 'release',
    });

    expect(fetchedCount).toEqual({ count: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${EVENTS_URL}/count?releaseId=release`,
    });
  });

  test("should list a page of the device's events", async () => {
    const fetchMock = stubFetch(() => Response.json([EVENT]));

    const fetchedEvents = await new HotCodePush().apps.devices.events.list({
      appId: 'app',
      deviceId: 'device',
      limit: 100,
      offset: 100,
    });

    expect(fetchedEvents).toEqual([EVENT]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${EVENTS_URL}?limit=100&offset=100`,
    });
  });
});
