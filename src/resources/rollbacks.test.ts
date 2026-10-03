import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RollbacksResource', () => {
  test('should post the rollback to its channel with its idempotency key', async () => {
    const release = { id: 'release', rolledBackFromReleaseId: 'previous' };
    const fetchMock = stubFetch(() => Response.json(release, { status: 201 }));

    const createdRelease =
      await new HotCodePush().apps.channels.rollbacks.create({
        appId: 'app',
        channelId: 'channel',
        idempotencyKey: 'key',
        isMandatory: false,
        toReleaseId: 'target',
      });

    expect(createdRelease).toEqual(release);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isMandatory: false, toReleaseId: 'target' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/apps/app/channels/channel/rollbacks',
    });
  });
});
