import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const UPDATE_STATISTICS = {
  days: [{ day: '2026-09-01', failed: 1, installed: 9, rolledBack: 0 }],
  failureReasons: [],
  releases: [],
  skippedReasons: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StatisticsUpdatesResource', () => {
  test("should get the update statistics of one channel's period", async () => {
    const fetchMock = stubFetch(() => Response.json(UPDATE_STATISTICS));

    const fetchedStatistics =
      await new HotCodePush().apps.statistics.updates.get({
        appId: 'app',
        channelId: 'channel',
        periodSince: '2026-09-01',
        periodUntil: '2026-09-30',
      });

    expect(fetchedStatistics).toEqual(UPDATE_STATISTICS);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/statistics/updates?channelId=channel&periodSince=2026-09-01&periodUntil=2026-09-30',
    });
  });
});
