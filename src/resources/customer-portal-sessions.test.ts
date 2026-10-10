import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const CUSTOMER_PORTAL_SESSION = { url: 'https://polar.sh/portal/session' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CustomerPortalSessionsResource', () => {
  test('should post without an idempotency key to create the customer portal session', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(CUSTOMER_PORTAL_SESSION, { status: 201 }),
    );

    const createdCustomerPortalSession =
      await new HotCodePush().organizations.customerPortalSessions.create({
        organizationId: 'organization',
      });

    expect(createdCustomerPortalSession).toEqual(CUSTOMER_PORTAL_SESSION);
    const sentRequest = resolveSentRequest(fetchMock);
    expect(sentRequest).toMatchObject({
      body: undefined,
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/organizations/organization/customer-portal-sessions',
    });
    expect(sentRequest.headers).not.toHaveProperty('Idempotency-Key');
  });

  test('should not retry the customer portal session when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.customerPortalSessions.create({
        organizationId: 'organization',
      }),
    );

    expect(attemptCount).toBe(1);
  });
});
