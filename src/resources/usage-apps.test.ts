import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const USAGE_APPS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/usage/apps';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsageAppsResource', () => {
  test('should count the apps with usage in the month', async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 3 }));

    const fetchedCount = await new HotCodePush().organizations.usage.apps.count(
      {
        month: '2026-09',
        organizationId: 'organization',
      },
    );

    expect(fetchedCount).toEqual({ count: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_APPS_URL}/count?month=2026-09`,
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
      await new HotCodePush().organizations.usage.apps.downloadCsv({
        month: '2026-09',
        organizationId: 'organization',
      });

    expect(await downloadedCsv.text()).toBe(
      '"month","appId","appName","monthlyActiveDeviceCount","dataTransferBytes"\r\n',
    );
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_APPS_URL}?month=2026-09&format=csv`,
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

    const fetchedRows = await new HotCodePush().organizations.usage.apps.list({
      limit: 10,
      month: '2026-09',
      offset: 10,
      organizationId: 'organization',
      relations: ['app'],
    });

    expect(fetchedRows).toEqual([appUsageMonth]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${USAGE_APPS_URL}?limit=10&month=2026-09&offset=10&relations=app`,
    });
  });
});
