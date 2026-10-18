import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';
import type { User } from './users';

const USER: User = {
  bannedAt: null,
  createdAt: '2026-09-29T00:00:00.000Z',
  deletedAt: null,
  discoverySource: null,
  email: 'user@example.test',
  emailVerified: true,
  id: 'user',
  image: null,
  intendedFramework: null,
  jobRole: null,
  lastSeenAt: '2026-10-12T00:00:00.000Z',
  locale: null,
  name: 'User',
  timeFormat: null,
  timeZone: null,
  twoFactorEnabled: false,
  updatedAt: '2026-09-29T00:00:00.000Z',
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

  test('should get the caller with their members and organizations when the relations are set', async () => {
    const fetchMock = stubFetch(() => Response.json({ ...USER, members: [] }));

    const fetchedUser = await new HotCodePush().users.get({
      relations: ['members', 'members.organization'],
      userId: 'me',
    });

    expect(fetchedUser).toEqual({ ...USER, members: [] });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/users/me?relations=members%2Cmembers.organization',
    });
  });
});
