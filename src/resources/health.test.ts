import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HealthResource', () => {
  test('should get /health', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(null));
    vi.stubGlobal('fetch', fetchMock);

    await expect(new HotCodePush().health.get()).resolves.toBeUndefined();

    expect(String(fetchMock.mock.lastCall?.[0])).toBe(
      'https://api.hotcodepush.com/health',
    );
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({ method: 'GET' });
  });
});
