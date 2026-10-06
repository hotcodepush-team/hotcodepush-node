import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('UserTokensResource', () => {
  test('should delete the tokens of the caller named by the ids when the user id is me', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().users.tokens.deleteMany({
      ids: ['first', 'second'],
      userId: 'me',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: 'https://api.hotcodepush.com/v1/users/me/tokens?ids=first%2Csecond',
    });
  });
});
