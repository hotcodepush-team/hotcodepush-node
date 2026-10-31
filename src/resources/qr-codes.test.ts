import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';
import type { ErrorBody } from '../types';

const QR_CODES_URL = 'https://api.hotcodepush.com/v1/qr-codes';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('QrCodesResource', () => {
  test('should get the QR image of the url in the given format and size', async () => {
    const fetchMock = stubFetch(
      () => new Response('png', { headers: { 'Content-Type': 'image/png' } }),
    );

    const fetchedQrCode = await new HotCodePush().qrCodes.get({
      format: 'png',
      size: 512,
      url: 'https://preview.hotcodepush.com',
    });

    expect(fetchedQrCode.type).toBe('image/png');
    expect(await fetchedQrCode.text()).toBe('png');
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${QR_CODES_URL}?format=png&size=512&url=${encodeURIComponent('https://preview.hotcodepush.com')}`,
    });
  });

  test('should throw validation when the url is on another host', async () => {
    stubFetch(() =>
      Response.json(
        {
          code: 'validation',
          details: [{ field: 'url', rule: 'host_not_allowed' }],
          message: 'The host of the URL is not allowed.',
        } satisfies ErrorBody,
        { status: 400 },
      ),
    );

    await expect(
      new HotCodePush().qrCodes.get({ url: 'https://example.com' }),
    ).rejects.toMatchObject({ code: 'validation', status: 400 });
  });
});
