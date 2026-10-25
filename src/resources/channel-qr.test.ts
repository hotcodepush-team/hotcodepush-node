import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';
import type { ErrorBody } from '../types';

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

  test('should throw not_found when the app has no channel link template', async () => {
    stubFetch(() =>
      Response.json(
        {
          code: 'not_found',
          message: 'The channel link is not set.',
        } satisfies ErrorBody,
        { status: 404 },
      ),
    );

    await expect(
      new HotCodePush().apps.channels.qr.get({
        appId: 'app',
        channelId: 'channel',
      }),
    ).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
