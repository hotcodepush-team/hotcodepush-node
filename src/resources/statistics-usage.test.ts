import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const USAGE_STATISTICS = {
  days: [{ bytes: 2048, checks: 40, day: '2026-09-01', downloadedBytes: 1024 }],
  months: [{ bytes: 2048, mau: 12, month: '2026-09-01' }],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StatisticsUsageResource', () => {
  test('should get the usage statistics of the period', async () => {
    const fetchMock = stubFetch(() => Response.json(USAGE_STATISTICS));

    const fetchedStatistics = await new HotCodePush().apps.statistics.usage.get(
      { appId: 'app', periodSince: '2026-09-01', periodUntil: '2026-09-30' },
    );

    expect(fetchedStatistics).toEqual(USAGE_STATISTICS);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/statistics/usage?periodSince=2026-09-01&periodUntil=2026-09-30',
    });
  });
});
