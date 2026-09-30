import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const RELEASES_URL = 'https://api.hotcodepush.com/v1/apps/app/releases';
const RELEASE = { id: 'release', number: 1, state: 'active' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ReleasesResource', () => {
  test('should get the release with the linked rows', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE));

    const fetchedRelease = await new HotCodePush().apps.releases.get({
      appId: 'app',
      relations: ['counters'],
      releaseId: 'release',
    });

    expect(fetchedRelease).toEqual(RELEASE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${RELEASES_URL}/release?relations=counters`,
    });
  });

  test('should list the releases of the app filtered by channel and state', async () => {
    const fetchMock = stubFetch(() => Response.json([RELEASE]));

    const fetchedReleases = await new HotCodePush().apps.releases.list({
      appId: 'app',
      channelId: 'channel',
      state: 'paused',
    });

    expect(fetchedReleases).toEqual([RELEASE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${RELEASES_URL}?channelId=channel&state=paused`,
    });
  });

  test('should post to pause the release', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE));

    await new HotCodePush().apps.releases.pause({
      appId: 'app',
      releaseId: 'release',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${RELEASES_URL}/release/pause`,
    });
  });

  test('should retry the pause when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.releases.pause({
        appId: 'app',
        releaseId: 'release',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should post to resume the release', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE));

    await new HotCodePush().apps.releases.resume({
      appId: 'app',
      releaseId: 'release',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${RELEASES_URL}/release/resume`,
    });
  });

  test('should retry the resume when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.releases.resume({
        appId: 'app',
        releaseId: 'release',
      }),
    );

    expect(attemptCount).toBe(3);
  });

  test('should post to revoke the release', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE));

    await new HotCodePush().apps.releases.revoke({
      appId: 'app',
      releaseId: 'release',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${RELEASES_URL}/release/revoke`,
    });
  });

  test('should not retry the revoke when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().apps.releases.revoke({
        appId: 'app',
        releaseId: 'release',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should patch the release', async () => {
    const fetchMock = stubFetch(() => Response.json(RELEASE));

    await new HotCodePush().apps.releases.update({
      appId: 'app',
      releaseId: 'release',
      rolloutPercentage: 50,
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { rolloutPercentage: 50 },
      method: 'PATCH',
      url: `${RELEASES_URL}/release`,
    });
  });
});
