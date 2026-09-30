import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const CHANNELS_URL = 'https://api.hotcodepush.com/v1/apps/app/channels';
const CHANNEL = { id: 'channel', name: 'staging', pausedAt: null };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelsResource', () => {
  test('should post the channel to its app with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(CHANNEL, { status: 201 }));

    const createdChannel = await new HotCodePush().apps.channels.create({
      appId: 'app',
      idempotencyKey: 'key',
      isProtected: true,
      name: 'staging',
    });

    expect(createdChannel).toEqual(CHANNEL);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isProtected: true, name: 'staging' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: CHANNELS_URL,
    });
  });

  test('should delete the channel', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.channels.delete({
      appId: 'app',
      channelId: 'channel',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${CHANNELS_URL}/channel`,
    });
  });

  test('should get the channel', async () => {
    const channel = { ...CHANNEL, activeDeviceCount: 3 };
    const fetchMock = stubFetch(() => Response.json(channel));

    const fetchedChannel = await new HotCodePush().apps.channels.get({
      appId: 'app',
      channelId: 'channel',
    });

    expect(fetchedChannel).toEqual(channel);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${CHANNELS_URL}/channel`,
    });
  });

  test('should list the channels of the app', async () => {
    const fetchMock = stubFetch(() => Response.json([CHANNEL]));

    const fetchedChannels = await new HotCodePush().apps.channels.list({
      appId: 'app',
      limit: 100,
    });

    expect(fetchedChannels).toEqual([CHANNEL]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${CHANNELS_URL}?limit=100`,
    });
  });

  test('should post to pause the channel', async () => {
    const fetchMock = stubFetch(() => Response.json(CHANNEL));

    await new HotCodePush().apps.channels.pause({
      appId: 'app',
      channelId: 'channel',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${CHANNELS_URL}/channel/pause`,
    });
  });

  test('should retry the pause when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.channels.pause({
        appId: 'app',
        channelId: 'channel',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should post to resume the channel', async () => {
    const fetchMock = stubFetch(() => Response.json(CHANNEL));

    await new HotCodePush().apps.channels.resume({
      appId: 'app',
      channelId: 'channel',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${CHANNELS_URL}/channel/resume`,
    });
  });

  test('should retry the resume when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.channels.resume({
        appId: 'app',
        channelId: 'channel',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should patch the channel', async () => {
    const fetchMock = stubFetch(() => Response.json(CHANNEL));

    await new HotCodePush().apps.channels.update({
      appId: 'app',
      channelId: 'channel',
      isDiscoverable: true,
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isDiscoverable: true },
      method: 'PATCH',
      url: `${CHANNELS_URL}/channel`,
    });
  });
});
