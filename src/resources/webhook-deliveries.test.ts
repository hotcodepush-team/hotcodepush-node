import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const DELIVERIES_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/webhooks/webhook/deliveries';
const DELIVERY = {
  attemptCount: 2,
  id: 'delivery',
  nextAttemptAt: '2026-10-20T12:05:00.000Z',
  responseBody: 'Bad Gateway',
  responseCode: 502,
  status: 'pending',
  type: 'release.created',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WebhookDeliveriesResource', () => {
  test('should count the deliveries of the webhook under the filters', async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 4 }));

    const fetchedCount =
      await new HotCodePush().organizations.webhooks.deliveries.count({
        createdSince: '2026-10-01T00:00:00.000Z',
        organizationId: 'organization',
        status: 'failed',
        webhookId: 'webhook',
      });

    expect(fetchedCount).toEqual({ count: 4 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DELIVERIES_URL}/count?createdSince=2026-10-01T00%3A00%3A00.000Z&status=failed`,
    });
  });

  test('should list the deliveries of the webhook under the filters', async () => {
    const fetchMock = stubFetch(() => Response.json([DELIVERY]));

    const fetchedDeliveries =
      await new HotCodePush().organizations.webhooks.deliveries.list({
        createdUntil: '2026-10-20T00:00:00.000Z',
        limit: 10,
        organizationId: 'organization',
        status: 'pending',
        webhookId: 'webhook',
      });

    expect(fetchedDeliveries).toEqual([DELIVERY]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DELIVERIES_URL}?createdUntil=2026-10-20T00%3A00%3A00.000Z&limit=10&status=pending`,
    });
  });

  test('should post to redeliver the delivery and answer it settled', async () => {
    const settledDelivery = {
      ...DELIVERY,
      attemptCount: 3,
      nextAttemptAt: null,
      responseBody: 'ok',
      responseCode: 200,
      status: 'succeeded',
    };
    const fetchMock = stubFetch(() => Response.json(settledDelivery));

    const redeliveredDelivery =
      await new HotCodePush().organizations.webhooks.deliveries.redeliver({
        deliveryId: 'delivery',
        organizationId: 'organization',
        webhookId: 'webhook',
      });

    expect(redeliveredDelivery).toEqual(settledDelivery);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${DELIVERIES_URL}/delivery/redeliver`,
    });
  });

  test('should not retry the redelivery when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.webhooks.deliveries.redeliver({
        deliveryId: 'delivery',
        organizationId: 'organization',
        webhookId: 'webhook',
      }),
    );

    expect(attemptCount).toBe(1);
  });
});
