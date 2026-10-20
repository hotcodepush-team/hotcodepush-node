import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const WEBHOOKS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/webhooks';
const WEBHOOK = {
  appId: null,
  events: ['release.created'],
  format: 'raw',
  id: 'webhook',
  isEnabled: true,
  name: 'Deploys',
};
const DELIVERY = {
  attemptCount: 1,
  id: 'delivery',
  nextAttemptAt: null,
  responseBody: 'ok',
  responseCode: 200,
  status: 'succeeded',
  type: 'webhook.test',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WebhooksResource', () => {
  test('should count the webhooks of the organization', async () => {
    const fetchMock = stubFetch(() => Response.json({ count: 2 }));

    const fetchedCount = await new HotCodePush().organizations.webhooks.count({
      organizationId: 'organization',
    });

    expect(fetchedCount).toEqual({ count: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${WEBHOOKS_URL}/count`,
    });
  });

  test('should post the webhook without an idempotency key and answer its secret', async () => {
    const createdWebhook = { ...WEBHOOK, secret: 'whsec_secret' };
    const fetchMock = stubFetch(() =>
      Response.json(createdWebhook, { status: 201 }),
    );

    const answeredWebhook =
      await new HotCodePush().organizations.webhooks.create({
        events: ['release.created'],
        format: 'raw',
        name: 'Deploys',
        organizationId: 'organization',
        url: 'https://example.com/hooks',
      });

    expect(answeredWebhook).toEqual(createdWebhook);
    const sentRequest = resolveSentRequest(fetchMock);
    expect(sentRequest).toMatchObject({
      body: {
        events: ['release.created'],
        format: 'raw',
        name: 'Deploys',
        url: 'https://example.com/hooks',
      },
      method: 'POST',
      url: WEBHOOKS_URL,
    });
    expect(sentRequest.headers).not.toHaveProperty('Idempotency-Key');
  });

  test('should not retry the creation when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.webhooks.create({
        events: ['release.created'],
        format: 'slack',
        name: 'Deploys',
        organizationId: 'organization',
        url: 'https://hooks.slack.com/services/T0/B0/token',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should delete the webhook', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.webhooks.delete({
      organizationId: 'organization',
      webhookId: 'webhook',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${WEBHOOKS_URL}/webhook`,
    });
  });

  test('should get the webhook', async () => {
    const fetchMock = stubFetch(() => Response.json(WEBHOOK));

    const fetchedWebhook = await new HotCodePush().organizations.webhooks.get({
      organizationId: 'organization',
      webhookId: 'webhook',
    });

    expect(fetchedWebhook).toEqual(WEBHOOK);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${WEBHOOKS_URL}/webhook`,
    });
  });

  test('should list the webhooks of the organization', async () => {
    const fetchMock = stubFetch(() => Response.json([WEBHOOK]));

    const fetchedWebhooks = await new HotCodePush().organizations.webhooks.list(
      {
        limit: 10,
        organizationId: 'organization',
      },
    );

    expect(fetchedWebhooks).toEqual([WEBHOOK]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${WEBHOOKS_URL}?limit=10`,
    });
  });

  test('should post to test the webhook and answer the settled delivery', async () => {
    const fetchMock = stubFetch(() => Response.json(DELIVERY, { status: 201 }));

    const testDelivery = await new HotCodePush().organizations.webhooks.test({
      organizationId: 'organization',
      webhookId: 'webhook',
    });

    expect(testDelivery).toEqual(DELIVERY);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${WEBHOOKS_URL}/webhook/test`,
    });
  });

  test('should not retry the test when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.webhooks.test({
        organizationId: 'organization',
        webhookId: 'webhook',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should patch the webhook', async () => {
    const fetchMock = stubFetch(() => Response.json(WEBHOOK));

    await new HotCodePush().organizations.webhooks.update({
      isEnabled: true,
      organizationId: 'organization',
      webhookId: 'webhook',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isEnabled: true },
      method: 'PATCH',
      url: `${WEBHOOKS_URL}/webhook`,
    });
  });
});
