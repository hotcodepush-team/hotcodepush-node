import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const CHECKOUT = { url: 'https://polar.sh/checkout/checkout' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CheckoutsResource', () => {
  test('should post the spending cap without an idempotency key to create the checkout', async () => {
    const fetchMock = stubFetch(() => Response.json(CHECKOUT, { status: 201 }));

    const createdCheckout =
      await new HotCodePush().organizations.checkouts.create({
        organizationId: 'organization',
        spendingCapCents: 5000,
      });

    expect(createdCheckout).toEqual(CHECKOUT);
    const sentRequest = resolveSentRequest(fetchMock);
    expect(sentRequest).toMatchObject({
      body: { spendingCapCents: 5000 },
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/organizations/organization/checkouts',
    });
    expect(sentRequest.headers).not.toHaveProperty('Idempotency-Key');
  });

  test('should not retry the checkout when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.checkouts.create({
        organizationId: 'organization',
        spendingCapCents: 5000,
      }),
    );

    expect(attemptCount).toBe(1);
  });
});
