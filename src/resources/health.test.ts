import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { HotCodePushError } from '../errors';
import { resolveSentRequest, stubFetch } from '../test-helpers';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('HealthResource', () => {
  test('should resolve when the api answers its plain-text ok', async () => {
    const fetchMock = stubFetch(() => new Response('ok'));

    await expect(new HotCodePush().health.get()).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: 'https://api.hotcodepush.com/health',
    });
  });

  test('should throw E_UNEXPECTED_RESPONSE with the status when the api answers unavailable', async () => {
    stubFetch(() => new Response('unavailable', { status: 503 }));

    const getPromise = new HotCodePush().health.get();
    const assertion =
      expect(getPromise).rejects.toBeInstanceOf(HotCodePushError);
    await vi.runAllTimersAsync();

    await assertion;
    await expect(getPromise).rejects.toMatchObject({
      code: 'E_UNEXPECTED_RESPONSE',
      status: 503,
    });
  });
});
