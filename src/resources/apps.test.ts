import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const APP_URL = 'https://api.hotcodepush.com/v1/apps/app';
const APP = { framework: 'capacitor', id: 'app', name: 'Demo' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AppsResource', () => {
  test('should delete the app', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await expect(
      new HotCodePush().apps.delete({ appId: 'app' }),
    ).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: APP_URL,
    });
  });

  test('should get the app', async () => {
    const fetchMock = stubFetch(() => Response.json(APP));

    const fetchedApp = await new HotCodePush().apps.get({ appId: 'app' });

    expect(fetchedApp).toEqual(APP);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: APP_URL,
    });
  });

  test('should post the target organization to transfer the app', async () => {
    const fetchMock = stubFetch(() => Response.json(APP));

    await new HotCodePush().apps.transfer({
      appId: 'app',
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { organizationId: 'organization' },
      method: 'POST',
      url: `${APP_URL}/transfer`,
    });
  });

  test('should patch the app', async () => {
    const fetchMock = stubFetch(() => Response.json(APP));

    await new HotCodePush().apps.update({
      appId: 'app',
      channelLinkTemplate: 'demo://channels/{channelId}',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { channelLinkTemplate: 'demo://channels/{channelId}' },
      method: 'PATCH',
      url: APP_URL,
    });
  });
});
