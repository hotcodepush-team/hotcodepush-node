import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { Mock } from 'vitest';

import { version } from '../package.json';
import { HotCodePushError } from './errors';
import { HttpClient, withRetry, withTimeout } from './http-client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HttpClient', () => {
  test('should request the default base url when no base url is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({}).fetchJson({ method: 'GET', path: '/health' });

    expect(String(fetchMock.mock.lastCall?.[0])).toBe(
      'https://api.hotcodepush.com/health',
    );
  });

  test('should request the given base url when a base url is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({ baseUrl: 'http://localhost:8787' }).fetchJson({
      method: 'GET',
      path: '/health',
    });

    expect(String(fetchMock.mock.lastCall?.[0])).toBe(
      'http://localhost:8787/health',
    );
  });

  test('should send the token as a bearer when a token is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({ token: 'token' }).fetchJson({
      method: 'GET',
      path: '/health',
    });

    expect(fetchMock.mock.lastCall?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer token',
    });
  });

  test('should send no authorization when no token is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({}).fetchJson({ method: 'GET', path: '/health' });

    expect(fetchMock.mock.lastCall?.[1]?.headers).not.toHaveProperty(
      'Authorization',
    );
  });

  test('should send node and the package version as the client when no client is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({}).fetchJson({ method: 'GET', path: '/health' });

    expect(fetchMock.mock.lastCall?.[1]?.headers).toMatchObject({
      'X-HotCodePush-Client': `node/${version}`,
    });
  });

  test('should send the given client when a client is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({ client: 'cli/1.2.3' }).fetchJson({
      method: 'GET',
      path: '/health',
    });

    expect(fetchMock.mock.lastCall?.[1]?.headers).toMatchObject({
      'X-HotCodePush-Client': 'cli/1.2.3',
    });
  });

  test('should send the body as json when a body is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({}).fetchJson({
      body: { name: 'production' },
      method: 'POST',
      path: '/v1/apps/app/channels',
    });

    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
      body: '{"name":"production"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
  });

  test('should return the parsed body when the response has one', async () => {
    stubFetch(() => Response.json({ id: 'channel' }));

    const fetchedChannel = await new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/channels/channel',
    });

    expect(fetchedChannel).toEqual({ id: 'channel' });
  });

  test('should throw a HotCodePushError when the response is not ok', async () => {
    stubFetch(() =>
      Response.json(
        { code: 'E_UNAUTHENTICATED', message: 'The token is invalid.' },
        { status: 401 },
      ),
    );

    const fetchPromise = new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/users/me',
    });

    await expect(fetchPromise).rejects.toBeInstanceOf(HotCodePushError);
    await expect(fetchPromise).rejects.toMatchObject({
      code: 'E_UNAUTHENTICATED',
      status: 401,
    });
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([408, 429, 500, 503])(
    'should retry three times when the status is %i',
    async status => {
      const fetchMock = vi.fn<typeof fetch>(
        async () => new Response(null, { status }),
      );

      const responsePromise = withRetry(fetchMock)('https://example.com');
      await vi.runAllTimersAsync();

      await expect(responsePromise).resolves.toMatchObject({ status });
      expect(fetchMock).toHaveBeenCalledTimes(3);
    },
  );

  test('should not retry when the status is not retryable', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 404 }),
    );

    const response = await withRetry(fetchMock)('https://example.com');

    expect(response.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('should back off exponentially between attempts', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    const responsePromise = withRetry(fetchMock)('https://example.com');
    await vi.advanceTimersByTimeAsync(499);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    await expect(responsePromise).resolves.toMatchObject({ status: 200 });
  });

  test('should throw the last error when every attempt throws', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new DOMException('The operation timed out.', 'TimeoutError');
    });

    const responsePromise = withRetry(fetchMock)('https://example.com');
    const assertion = expect(responsePromise).rejects.toMatchObject({
      name: 'TimeoutError',
    });
    await vi.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('withTimeout', () => {
  test('should abort the request when the timeout elapses', async () => {
    const fetchMock = vi.fn<typeof fetch>(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(init.signal?.reason),
          );
        }),
    );

    await expect(
      withTimeout(fetchMock, 1)('https://example.com'),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
  });
});

function stubFetch(createResponse: () => Response): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async () => createResponse());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
