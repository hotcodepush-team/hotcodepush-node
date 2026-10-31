import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const RELEASES_URL =
  'https://api.hotcodepush.com/v1/apps/app/channels/channel/releases';
const RELEASE = { id: 'release', number: 1, status: 'active' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChannelReleasesResource', () => {
  test('should post the release to its channel with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE, { status: 201 }));

    const createdRelease =
      await new HotCodePush().apps.channels.releases.create({
        appId: 'app',
        bundleId: 'bundle',
        channelId: 'channel',
        idempotencyKey: 'key',
        rolloutPercent: 10,
      });

    expect(createdRelease).toEqual(RELEASE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { bundleId: 'bundle', rolloutPercent: 10 },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: RELEASES_URL,
    });
  });

  test('should post a release of what another channel serves with its auto-pause overrides', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE, { status: 201 }));

    const createdRelease =
      await new HotCodePush().apps.channels.releases.create({
        appId: 'app',
        channelId: 'channel',
        failureAction: 'revoke',
        failureMinimumUpdateCount: 20,
        failureThresholdPercent: 10,
        fromChannelId: 'source',
        idempotencyKey: 'key',
      });

    expect(createdRelease).toEqual(RELEASE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        failureAction: 'revoke',
        failureMinimumUpdateCount: 20,
        failureThresholdPercent: 10,
        fromChannelId: 'source',
      },
      method: 'POST',
      url: RELEASES_URL,
    });
  });

  test('should post the bulk revocation from a release number', async () => {
    const fetchMock = stubFetch(() =>
      Response.json([{ ...RELEASE, status: 'revoked' }]),
    );

    const revokedReleases =
      await new HotCodePush().apps.channels.releases.revoke({
        appId: 'app',
        channelId: 'channel',
        fromNumber: 1,
      });

    expect(revokedReleases).toEqual([{ ...RELEASE, status: 'revoked' }]);
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
