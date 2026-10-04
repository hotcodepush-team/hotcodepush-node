import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const SIGNING_KEY = { id: 'signing-key', publicKey: 'rsa-v1_5-sha256:a2V5' };
const SIGNING_KEYS_URL = 'https://api.hotcodepush.com/v1/apps/app/signing-keys';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SigningKeysResource', () => {
  test('should count the signing keys of the app', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 1 }));

    const fetchedCount = await new HotCodePush().apps.signingKeys.count({
      appId: 'app',
    });

    expect(fetchedCount).toEqual({ total: 1 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${SIGNING_KEYS_URL}/count`,
    });
  });

  test('should post the public key', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(SIGNING_KEY, { status: 201 }),
    );

    const createdSigningKey = await new HotCodePush().apps.signingKeys.create({
      appId: 'app',
      publicKey: 'rsa-v1_5-sha256:a2V5',
    });

    expect(createdSigningKey).toEqual(SIGNING_KEY);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { publicKey: 'rsa-v1_5-sha256:a2V5' },
      method: 'POST',
      url: SIGNING_KEYS_URL,
    });
  });

  test('should not retry the registration when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.signingKeys.create({
        appId: 'app',
        publicKey: 'rsa-v1_5-sha256:a2V5',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should delete the signing key', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.signingKeys.delete({
      appId: 'app',
      signingKeyId: 'signing-key',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${SIGNING_KEYS_URL}/signing-key`,
    });
  });

  test('should list the signing keys of the app', async () => {
    const fetchMock = stubFetch(() => Response.json([SIGNING_KEY]));

    const fetchedSigningKeys = await new HotCodePush().apps.signingKeys.list({
      appId: 'app',
      limit: 20,
    });

    expect(fetchedSigningKeys).toEqual([SIGNING_KEY]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${SIGNING_KEYS_URL}?limit=20`,
    });
  });
});
