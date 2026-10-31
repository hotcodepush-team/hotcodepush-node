import { vi } from 'vitest';
import type { Mock } from 'vitest';

import type { ErrorBody } from './types';

export interface SentRequest {
  body: unknown;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export async function countAttemptsWhenUnavailable(
  call: () => Promise<unknown>,
): Promise<number> {
  vi.useFakeTimers();
  try {
    const fetchMock = stubFetch(() => new Response(null, { status: 503 }));
    const settledCall = call().catch(() => undefined);
    await vi.runAllTimersAsync();
    await settledCall;
    return fetchMock.mock.calls.length;
  } finally {
    vi.useRealTimers();
  }
}

export function resolveSentRequest(fetchMock: Mock<typeof fetch>): SentRequest {
  const [input, init] = fetchMock.mock.lastCall ?? [];
  if (input === undefined) {
    throw new Error('fetch was not called.');
  }
  return {
    body: typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body,
    headers: { ...(init?.headers as Record<string, string> | undefined) },
    method: init?.method ?? 'GET',
    url: String(input),
  };
}

export function resolveSentMethodsAndUrls(
  fetchMock: Mock<typeof fetch>,
): string[] {
  return fetchMock.mock.calls.map(
    ([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`,
  );
}

export async function runCallAfterBadGateway<T>(
  call: () => Promise<T>,
  createResponse: () => Response,
): Promise<{ attemptCount: number; result: T }> {
  vi.useFakeTimers();
  try {
    const fetchMock = stubFetch(createResponse);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 502 }));
    const resultPromise = call();
    await vi.runAllTimersAsync();
    const result = await resultPromise;
    return { attemptCount: fetchMock.mock.calls.length, result };
  } finally {
    vi.useRealTimers();
  }
}

// Undo with `vi.unstubAllGlobals()`.
export function stubFetch(
  createResponse: () => Response = () => Response.json({}),
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async () => createResponse());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function stubMultipartUploadFetch(
  completedBody: unknown,
  failedPartNumber?: number,
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const { pathname } = new URL(String(input));
    const partNumber = Number(/\/parts\/(\d+)$/.exec(pathname)?.[1]);
    if (init?.method === 'DELETE') {
      return Response.json(
        {
          code: 'not_found',
          message: 'The upload does not exist.',
        } satisfies ErrorBody,
        { status: 404 },
      );
    }
    if (init?.method === 'PUT' && partNumber === failedPartNumber) {
      return Response.json(
        {
          code: 'upload_incomplete',
          message: 'The part was refused.',
        } satisfies ErrorBody,
        { status: 409 },
      );
    }
    if (init?.method === 'PUT') {
      return Response.json({ etag: `etag-${partNumber}`, partNumber });
    }
    if (pathname.endsWith('/complete')) {
      return Response.json(completedBody);
    }
    return Response.json({ uploadId: 'upload' }, { status: 201 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
