import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const USAGE_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/usage';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsageResource', () => {
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
});
