import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const AUDIENCE = {
  estimatedAtRollout: 5,
  reached: 10,
  total: 20,
  warnings: [],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReleaseAudienceResource', () => {
  test('should get the audience the release reaches', async () => {
    const fetchMock = stubFetch(() => Response.json(AUDIENCE));

    const fetchedAudience = await new HotCodePush().apps.releases.audience.get({
      appId: 'app',
      releaseId: 'release',
    });

    expect(fetchedAudience).toEqual(AUDIENCE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/releases/release/audience',
    });
  });
});
