import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const FLEET_STATISTICS = { binaryVersions: [{ count: 3, value: '2.4.1' }] };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StatisticsFleetResource', () => {
  test("should get the fleet statistics of one channel's devices", async () => {
    const fetchMock = stubFetch(() => Response.json(FLEET_STATISTICS));

    const fetchedStatistics = await new HotCodePush().apps.statistics.fleet.get(
      { appId: 'app', channelId: 'channel' },
    );

    expect(fetchedStatistics).toEqual(FLEET_STATISTICS);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/statistics/fleet?channelId=channel',
    });
  });
});
