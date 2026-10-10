import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const SUBSCRIPTION_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/subscription';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SubscriptionResource', () => {
  test('should post the reason and the comment to cancel the subscription', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.subscription.cancel({
      comment: 'Too few releases a month.',
      organizationId: 'organization',
      reason: 'not_enough_value',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        comment: 'Too few releases a month.',
        reason: 'not_enough_value',
      },
      method: 'POST',
      url: `${SUBSCRIPTION_URL}/cancel`,
    });
  });

  test('should retry the cancel when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.subscription.cancel({
        organizationId: 'organization',
        reason: 'too_expensive',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should post to uncancel the subscription', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.subscription.uncancel({
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${SUBSCRIPTION_URL}/uncancel`,
    });
  });

  test('should retry the uncancel when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.subscription.uncancel({
        organizationId: 'organization',
      }),
    );

    expect(attemptCount).toBe(3);
  });
});
