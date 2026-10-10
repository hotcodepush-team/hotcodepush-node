import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const BILLING_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/billing';
const BILLING = { plan: 'pay_as_you_go', spendingCapCents: 5000 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BillingResource', () => {
  test('should get the billing', async () => {
    const fetchMock = stubFetch(() => Response.json(BILLING));

    const fetchedBilling = await new HotCodePush().organizations.billing.get({
      organizationId: 'organization',
    });

    expect(fetchedBilling).toEqual(BILLING);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: BILLING_URL,
    });
  });

  test('should patch the spending cap', async () => {
    const fetchMock = stubFetch(() => Response.json(BILLING));

    const updatedBilling = await new HotCodePush().organizations.billing.update(
      {
        organizationId: 'organization',
        spendingCapCents: 5000,
      },
    );

    expect(updatedBilling).toEqual(BILLING);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { spendingCapCents: 5000 },
      method: 'PATCH',
      url: BILLING_URL,
    });
  });
});
