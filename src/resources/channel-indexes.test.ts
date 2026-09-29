import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelIndexesResource', () => {
  test("should get the channel's index for the platform", async () => {
    const channelIndex = { schema: 1, sequence: 7 };
    const fetchMock = stubFetch(() => Response.json(channelIndex));

    const fetchedChannelIndex =
      await new HotCodePush().apps.channels.indexes.get({
        appId: 'app',
        channelId: 'channel',
        platform: 'ios',
      });

    expect(fetchedChannelIndex).toEqual(channelIndex);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/v1/apps/app/channels/channel/indexes/ios',
    });
  });
});
