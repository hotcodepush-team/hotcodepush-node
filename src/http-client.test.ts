import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { version } from '../package.json';
import { HotCodePushError } from './errors';
import { HttpClient, resolvePath, withRetry, withTimeout } from './http-client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from './test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HttpClient', () => {
  test('should give each attempt sixty seconds', async () => {
    stubFetch(() => new Response(null));
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');

    await new HttpClient({}).fetchJson({ method: 'GET', path: '/health' });

    expect(timeoutSpy).toHaveBeenCalledWith(60_000);
    timeoutSpy.mockRestore();
  });

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

  test('should send the given user agent when a user agent is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({ userAgent: 'hotcodepush-cli/1.2.3' }).fetchJson({
      method: 'GET',
      path: '/health',
    });

    expect(fetchMock.mock.lastCall?.[1]?.headers).toMatchObject({
      'User-Agent': 'hotcodepush-cli/1.2.3',
    });
  });

  test('should leave the user agent to the runtime when no user agent is set', async () => {
    const fetchMock = stubFetch(() => new Response(null));

    await new HttpClient({}).fetchJson({ method: 'GET', path: '/health' });

    expect(fetchMock.mock.lastCall?.[1]?.headers).not.toHaveProperty(
      'User-Agent',
    );
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

  test('should send the query without its undefined values and empty lists when a query is set', async () => {
    const fetchMock = stubFetch();

    await new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/organizations/organization/members',
      query: { limit: 10, name: undefined, offset: 0, relations: [] },
    });

    expect(resolveSentRequest(fetchMock).url).toBe(
      'https://api.hotcodepush.com/v1/organizations/organization/members?limit=10&offset=0',
    );
  });

  test('should send the relations in the query as a comma list', async () => {
    const fetchMock = stubFetch();

    await new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/apps/app/releases/release',
      query: { relations: ['bundle', 'channel'] },
    });

    expect(resolveSentRequest(fetchMock).url).toBe(
      'https://api.hotcodepush.com/v1/apps/app/releases/release?relations=bundle%2Cchannel',
    );
  });

  test('should send the ids in the query as a comma list', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HttpClient({}).fetchJson({
      method: 'DELETE',
      path: '/v1/apps/app/channels',
      query: { ids: ['first', 'second'] },
    });

    expect(resolveSentRequest(fetchMock).url).toBe(
      'https://api.hotcodepush.com/v1/apps/app/channels?ids=first%2Csecond',
    );
  });

  test('should repeat the parameter of any other list in the query', async () => {
    const fetchMock = stubFetch();

    await new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/apps/app/channels/channel/audience',
      query: { attribute: ['tier=gold,silver'], binary: ['>=2.0.0', '<3.0.0'] },
    });

    expect(resolveSentRequest(fetchMock).url).toBe(
      'https://api.hotcodepush.com/v1/apps/app/channels/channel/audience?attribute=tier%3Dgold%2Csilver&binary=%3E%3D2.0.0&binary=%3C3.0.0',
    );
  });

  test('should return the parsed body when the response has one', async () => {
    stubFetch(() => Response.json({ id: 'channel' }));

    const fetchedChannel = await new HttpClient({}).fetchJson({
      method: 'GET',
      path: '/v1/channels/channel',
    });

    expect(fetchedChannel).toEqual({ id: 'channel' });
  });

  test('should throw E_UNEXPECTED_RESPONSE with the status when a rate limit in front of the api answers html', async () => {
    stubFetch(
      () => new Response('<html>Too Many Requests</html>', { status: 429 }),
    );

    const fetchPromise = new HttpClient({}).fetchJson({
      method: 'POST',
      path: '/v1/invitations/invitation/accept',
    });

    await expect(fetchPromise).rejects.toBeInstanceOf(HotCodePushError);
    await expect(fetchPromise).rejects.toMatchObject({
      code: 'E_UNEXPECTED_RESPONSE',
      status: 429,
    });
  });

  test.each(['DELETE', 'GET', 'PUT'] as const)(
    'should retry a %s when the api is unavailable',
    async method => {
      const attemptCount = await countAttemptsWhenUnavailable(() =>
        new HttpClient({}).fetchJson({ method, path: '/v1/apps/app' }),
      );

      expect(attemptCount).toBe(3);
    },
  );

  test.each(['PATCH', 'POST'] as const)(
    'should not retry a %s when the api is unavailable',
    async method => {
      const attemptCount = await countAttemptsWhenUnavailable(() =>
        new HttpClient({}).fetchJson({ method, path: '/v1/apps/app' }),
      );

      expect(attemptCount).toBe(1);
    },
  );

  test('should retry a post when the api is unavailable and the call is retryable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HttpClient({}).fetchJson({
        isRetryable: true,
        method: 'POST',
        path: '/v1/apps/app/channels/channel/pause',
      }),
    );

    expect(attemptCount).toBe(3);
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

describe('HttpClient.fetchCreatingPost', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should send the given idempotency key when one is set', async () => {
    const fetchMock = stubFetch();

    await new HttpClient({}).fetchCreatingPost({
      body: { name: 'Acme' },
      idempotencyKey: 'key',
      path: '/v1/organizations',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { name: 'Acme' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
    });
  });

  test('should send one generated idempotency key on every attempt when none is set', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ id: 'organization' }));
    vi.stubGlobal('fetch', fetchMock);

    const createPromise = new HttpClient({}).fetchCreatingPost({
      body: { name: 'Acme' },
      path: '/v1/organizations',
    });
    await vi.runAllTimersAsync();
    await createPromise;

    const [firstKey, secondKey] = fetchMock.mock.calls.map(
      ([, init]) =>
        (init?.headers as Record<string, string>)['Idempotency-Key'],
    );
    expect(firstKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(secondKey).toBe(firstKey);
  });
});

describe('HttpClient.fetchUpload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should put a blob with its size as the content length', async () => {
    const fetchMock = stubFetch();
    const blob = new Blob(['gzip bytes']);

    await new HttpClient({}).fetchUpload({
      body: blob,
      contentType: 'application/gzip',
      path: '/v1/apps/app/files/sha256',
    });

    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
      body: blob,
      headers: { 'Content-Length': '10', 'Content-Type': 'application/gzip' },
      method: 'PUT',
    });
  });

  test('should put a stream half-duplex with the given content length', async () => {
    const fetchMock = stubFetch();
    const stream = new Blob(['tar bytes']).stream();

    await new HttpClient({}).fetchUpload({
      body: stream,
      contentLength: 9,
      contentType: 'application/x-tar',
      path: '/v1/apps/app/bundles/bundle/pack',
    });

    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
      body: stream,
      duplex: 'half',
      headers: { 'Content-Length': '9', 'Content-Type': 'application/x-tar' },
      method: 'PUT',
    });
  });

  test('should give each attempt ten minutes', async () => {
    stubFetch();
    const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');

    await new HttpClient({}).fetchUpload({
      body: new Blob(['tar bytes']),
      contentType: 'application/x-tar',
      path: '/v1/apps/app/bundles/bundle/pack',
    });

    expect(timeoutSpy).toHaveBeenCalledWith(600_000);
    timeoutSpy.mockRestore();
  });

  test('should retry a blob when the status is retryable', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ sizeBytes: 9 }));
    vi.stubGlobal('fetch', fetchMock);

    const uploadPromise = new HttpClient({}).fetchUpload({
      body: new Blob(['tar bytes']),
      contentType: 'application/x-tar',
      path: '/v1/apps/app/bundles/bundle/pack',
    });
    await vi.runAllTimersAsync();

    await expect(uploadPromise).resolves.toEqual({ sizeBytes: 9 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('should not retry a stream, which is read once', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 503 }));

    const uploadPromise = new HttpClient({}).fetchUpload({
      body: new Blob(['tar bytes']).stream(),
      contentLength: 9,
      contentType: 'application/x-tar',
      path: '/v1/apps/app/bundles/bundle/pack',
    });

    await expect(uploadPromise).rejects.toMatchObject({ status: 503 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('resolvePath', () => {
  test('should fill the template with the encoded parameters', () => {
    expect(
      resolvePath('/v1/apps/{appId}/channels/{channelId}', {
        appId: 'app',
        channelId: 'a/b',
      }),
    ).toBe('/v1/apps/app/channels/a%2Fb');
  });

  test('should fill a number parameter as its digits', () => {
    expect(
      resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/parts/{partNumber}',
        { appId: 'app', partNumber: 2, sha256: 'sha256', uploadId: 'upload' },
      ),
    ).toBe('/v1/apps/app/files/sha256/uploads/upload/parts/2');
  });

  test('should throw when a parameter is missing', () => {
    expect(() => resolvePath('/v1/apps/{appId}', {})).toThrow(
      'The path parameter appId of /v1/apps/{appId} is missing.',
    );
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
