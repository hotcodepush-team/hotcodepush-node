import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';
import type { User } from './users';

const USER: User = {
  createdAt: '2026-09-29T00:00:00.000Z',
  credential: 'token',
  email: 'user@example.test',
  id: 'user',
  isEmailVerified: true,
  name: 'User',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsersResource', () => {
  test('should delete the caller with the password when the user id is me', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await expect(
      new HotCodePush().users.delete({
        password: 'correct horse battery staple',
        userId: 'me',
      }),
    ).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { password: 'correct horse battery staple' },
      method: 'DELETE',
      url: 'https://api.hotcodepush.com/v1/users/me',
    });
  });

  test('should get the caller when the user id is me', async () => {
    const fetchMock = stubFetch(() => Response.json(USER));

    const fetchedUser = await new HotCodePush().users.get({ userId: 'me' });

    expect(fetchedUser).toEqual(USER);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/users/me',
    });
  });
});
