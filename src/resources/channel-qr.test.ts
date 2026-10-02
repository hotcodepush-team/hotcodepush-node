import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const QR_URL = 'https://api.hotcodepush.com/v1/apps/app/channels/channel/qr';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelQrResource', () => {
  test('should get the qr image of the channel in the given format', async () => {
    const fetchMock = stubFetch(
      () => new Response('png', { headers: { 'Content-Type': 'image/png' } }),
    );

    const fetchedQr = await new HotCodePush().apps.channels.qr.get({
      appId: 'app',
      channelId: 'channel',
      format: 'png',
    });

    expect(fetchedQr.type).toBe('image/png');
    expect(await fetchedQr.text()).toBe('png');
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${QR_URL}?format=png`,
    });
  });

  test('should throw E_NOT_FOUND when the app has no channel link template', async () => {
    stubFetch(() =>
      Response.json(
        { code: 'E_NOT_FOUND', message: 'The channel link is not set.' },
        { status: 404 },
      ),
    );

    await expect(
      new HotCodePush().apps.channels.qr.get({
        appId: 'app',
        channelId: 'channel',
      }),
    ).rejects.toMatchObject({ code: 'E_NOT_FOUND', status: 404 });
  });
});
