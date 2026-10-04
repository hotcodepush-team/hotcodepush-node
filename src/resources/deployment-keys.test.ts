import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const DEPLOYMENT_KEY = { channelId: 'channel', key: 'key', platform: 'ios' };
const DEPLOYMENT_KEYS_URL =
  'https://api.hotcodepush.com/v1/apps/app/deployment-keys';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DeploymentKeysResource', () => {
  test('should count the deployment keys of the app', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 2 }));

    const fetchedCount = await new HotCodePush().apps.deploymentKeys.count({
      appId: 'app',
    });

    expect(fetchedCount).toEqual({ total: 2 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DEPLOYMENT_KEYS_URL}/count`,
    });
  });

  test('should post the channel and the platform with its idempotency key', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(DEPLOYMENT_KEY, { status: 201 }),
    );

    const createdDeploymentKey =
      await new HotCodePush().apps.deploymentKeys.create({
        appId: 'app',
        channelId: 'channel',
        idempotencyKey: 'idempotency-key',
        platform: 'ios',
      });

    expect(createdDeploymentKey).toEqual(DEPLOYMENT_KEY);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { channelId: 'channel', platform: 'ios' },
      headers: { 'Idempotency-Key': 'idempotency-key' },
      method: 'POST',
      url: DEPLOYMENT_KEYS_URL,
    });
  });

  test('should delete the deployment key', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.deploymentKeys.delete({
      appId: 'app',
      key: 'key',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${DEPLOYMENT_KEYS_URL}/key`,
    });
  });

  test('should list the deployment keys of the app', async () => {
    const fetchMock = stubFetch(() => Response.json([DEPLOYMENT_KEY]));

    const fetchedDeploymentKeys =
      await new HotCodePush().apps.deploymentKeys.list({
        appId: 'app',
        limit: 20,
      });

    expect(fetchedDeploymentKeys).toEqual([DEPLOYMENT_KEY]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DEPLOYMENT_KEYS_URL}?limit=20`,
    });
  });
});
