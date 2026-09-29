import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UsersResource', () => {
  test('should delete the caller when the user id is me', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await expect(
      new HotCodePush().users.delete({ userId: 'me' }),
    ).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: 'https://api.hotcodepush.com/v1/users/me',
    });
  });
});
