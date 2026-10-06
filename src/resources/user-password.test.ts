import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UserPasswordResource', () => {
  test('should post the first password of the caller when the user id is me', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await expect(
      new HotCodePush().users.password.create({
        password: 'correct horse battery staple',
        userId: 'me',
      }),
    ).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { password: 'correct horse battery staple' },
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/users/me/password',
    });
  });

  test('should not retry the password when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().users.password.create({
        password: 'correct horse battery staple',
        userId: 'me',
      }),
    );

    expect(attemptCount).toBe(1);
  });
});
