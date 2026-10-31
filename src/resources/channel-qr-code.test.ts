import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';
import type { ErrorBody } from '../types';

const QR_CODE_URL =
  'https://api.hotcodepush.com/v1/apps/app/channels/channel/qr-code';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelQrCodeResource', () => {
  test('should get the QR image of the channel in the given format', async () => {
    const fetchMock = stubFetch(
      () => new Response('png', { headers: { 'Content-Type': 'image/png' } }),
    );

    const fetchedQrCode = await new HotCodePush().apps.channels.qrCode.get({
      appId: 'app',
      channelId: 'channel',
      format: 'png',
    });

    expect(fetchedQrCode.type).toBe('image/png');
    expect(await fetchedQrCode.text()).toBe('png');
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${QR_CODE_URL}?format=png`,
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
      new HotCodePush().apps.channels.qrCode.get({
        appId: 'app',
        channelId: 'channel',
      }),
    ).rejects.toMatchObject({ code: 'not_found', status: 404 });
  });
});
