import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const RELEASES_URL =
  'https://api.hotcodepush.com/v1/apps/app/channels/channel/releases';
const RELEASE = { id: 'release', number: 1, state: 'active' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelReleasesResource', () => {
  test("should count the channel's release log", async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().apps.channels.releases.count({
      appId: 'app',
      channelId: 'channel',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${RELEASES_URL}/count`,
    });
  });

  test('should post the release to its channel with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE, { status: 201 }));

    const createdRelease =
      await new HotCodePush().apps.channels.releases.create({
        appId: 'app',
        bundleId: 'bundle',
        channelId: 'channel',
        idempotencyKey: 'key',
        rolloutPercentage: 10,
      });

    expect(createdRelease).toEqual(RELEASE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { bundleId: 'bundle', rolloutPercentage: 10 },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: RELEASES_URL,
    });
  });

  test('should post a release of what another channel serves with its auto-pause overrides', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ ...RELEASE, warnings: [] }, { status: 201 }),
    );

    const createdRelease =
      await new HotCodePush().apps.channels.releases.create({
        appId: 'app',
        channelId: 'channel',
        failureAction: 'revoke',
        failureMinSample: 20,
        failureThresholdPercent: 10,
        fromChannelId: 'source',
        idempotencyKey: 'key',
      });

    expect(createdRelease).toEqual({ ...RELEASE, warnings: [] });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        failureAction: 'revoke',
        failureMinSample: 20,
        failureThresholdPercent: 10,
        fromChannelId: 'source',
      },
      method: 'POST',
      url: RELEASES_URL,
    });
  });

  test("should list the channel's release log with the linked rows", async () => {
    const fetchMock = stubFetch(() => Response.json([RELEASE]));

    const fetchedReleases = await new HotCodePush().apps.channels.releases.list(
      {
        appId: 'app',
        channelId: 'channel',
        relations: ['bundle', 'channel', 'counters'],
      },
    );

    expect(fetchedReleases).toEqual([RELEASE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${RELEASES_URL}?relations=bundle%2Cchannel%2Ccounters`,
    });
  });

  test('should post the bulk revocation from a release number', async () => {
    const fetchMock = stubFetch(() =>
      Response.json([{ ...RELEASE, state: 'revoked' }]),
    );

    const revokedReleases =
      await new HotCodePush().apps.channels.releases.revoke({
        appId: 'app',
        channelId: 'channel',
        fromNumber: 1,
      });

    expect(revokedReleases).toEqual([{ ...RELEASE, state: 'revoked' }]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { fromNumber: 1 },
      method: 'POST',
      url: `${RELEASES_URL}/revoke`,
    });
  });

  test('should retry the bulk revocation when the API is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.channels.releases.revoke({
        appId: 'app',
        channelId: 'channel',
        releaseIds: ['release'],
      }),
    );

    expect(attemptCount).toBe(3);
  });
});
