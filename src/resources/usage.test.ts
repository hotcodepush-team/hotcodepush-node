import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const USAGE_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/usage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsageResource', () => {
  test('should count the apps with usage in the month', async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 3 }));

    const fetchedCount = await new HotCodePush().organizations.usage.countApps({
      month: '2026-09',
      organizationId: 'organization',
    });

    expect(fetchedCount).toEqual({ count: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_URL}/apps/count?month=2026-09`,
    });
  });

  test("should download the apps' usage in the month as csv", async () => {
    const fetchMock = stubFetch(
      () =>
        new Response(
          '"month","appId","appName","monthlyActiveDeviceCount","dataTransferBytes"\r\n',
          {
            headers: { 'Content-Type': 'text/csv; charset=utf-8' },
          },
        ),
    );

    const downloadedCsv =
      await new HotCodePush().organizations.usage.downloadAppsCsv({
        month: '2026-09',
        organizationId: 'organization',
      });

    expect(await downloadedCsv.text()).toBe(
      '"month","appId","appName","monthlyActiveDeviceCount","dataTransferBytes"\r\n',
    );
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_URL}/apps?month=2026-09&format=csv`,
    });
  });

  test("should get the organization's usage in the month", async () => {
    const usage = {
      dataTransferBytes: 2048,
      month: '2026-09',
      monthlyActiveDeviceCount: 12,
    };
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

  test("should list a page of the apps' usage with their apps", async () => {
    const appUsageMonth = {
      app: { id: 'app', name: 'Demo' },
      appId: 'app',
      dataTransferBytes: 2048,
      month: '2026-09',
      monthlyActiveDeviceCount: 12,
    };
    const fetchMock = stubFetch(() => Response.json([appUsageMonth]));

    const fetchedRows = await new HotCodePush().organizations.usage.listApps({
      limit: 10,
      month: '2026-09',
      offset: 10,
      organizationId: 'organization',
      relations: ['app'],
    });

    expect(fetchedRows).toEqual([appUsageMonth]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_URL}/apps?limit=10&month=2026-09&offset=10&relations=app`,
    });
  });
});
