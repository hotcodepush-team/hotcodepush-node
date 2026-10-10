import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LimitsResource', () => {
  test('should get the limits in effect', async () => {
    const limits = {
      appsLimit: { default: 3, isOverridden: true, value: 10 },
    };
    const fetchMock = stubFetch(() => Response.json(limits));

    const fetchedLimits = await new HotCodePush().organizations.limits.get({
      organizationId: 'organization',
    });

    expect(fetchedLimits).toEqual(limits);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/organizations/organization/limits',
    });
  });
});
