import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UserSessionsResource', () => {
  test('should delete the sessions of the caller named by the ids when the user id is me', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().users.sessions.deleteMany({
      ids: ['first', 'second'],
      userId: 'me',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: 'https://api.hotcodepush.com/v1/users/me/sessions?ids=first%2Csecond',
    });
  });
});
