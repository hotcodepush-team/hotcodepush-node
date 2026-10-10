import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const USAGE_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/usage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsageResource', () => {
  test("should download the month's usage as csv", async () => {
    const fetchMock = stubFetch(
      () =>
        new Response('"appId","appName","mau","bytes"\n', {
          headers: { 'Content-Type': 'text/csv; charset=utf-8' },
        }),
    );

    const downloadedCsv =
      await new HotCodePush().organizations.usage.downloadCsv({
        month: '2026-09',
        organizationId: 'organization',
      });

    expect(await downloadedCsv.text()).toBe(
      '"appId","appName","mau","bytes"\n',
    );
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_URL}?month=2026-09&format=csv`,
    });
  });

  test("should get the month's usage", async () => {
    const usage = { apps: [], month: '2026-09', total: { bytes: 0, mau: 0 } };
    const fetchMock = stubFetch(() => Response.json(usage));

    const fetchedUsage = await new HotCodePush().organizations.usage.get({
      month: '2026-09',
      organizationId: 'organization',
    });

    expect(fetchedUsage).toEqual(usage);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_URL}?month=2026-09`,
    });
  });
});
