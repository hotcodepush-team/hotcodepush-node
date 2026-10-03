import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const AUDIENCE = {
  byBinaryVersion: [{ count: 5, value: '2.4.1' }],
  byPlatform: [{ count: 5, value: 'ios' }],
  estimatedAtRollout: 1,
  reached: 5,
  total: 10,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelAudienceResource', () => {
  test('should get the audience with each condition repeated', async () => {
    const fetchMock = stubFetch(() => Response.json(AUDIENCE));

    const fetchedAudience = await new HotCodePush().apps.channels.audience.get({
      appId: 'app',
      binary: ['>=2.0.0', '<3.0.0'],
      channelId: 'channel',
      rollout: 10,
    });

    expect(fetchedAudience).toEqual(AUDIENCE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/channels/channel/audience?binary=%3E%3D2.0.0&binary=%3C3.0.0&rollout=10',
    });
  });
});
