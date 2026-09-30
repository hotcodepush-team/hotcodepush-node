import { vi } from 'vitest';
import type { Mock } from 'vitest';

export interface SentRequest {
  body: unknown;
  headers: Record<string, string>;
  method: string;
  url: string;
}

/**
 * Runs a call against an API answering 503 on every attempt and counts the attempts the call makes.
 */
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

/**
 * The last request the stubbed `fetch` received, a JSON body parsed and any other body as it was passed.
 */
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

/**
 * Every request the stubbed `fetch` received, as its method and URL.
 */
export function resolveSentMethodsAndUrls(
  fetchMock: Mock<typeof fetch>,
): string[] {
  return fetchMock.mock.calls.map(
    ([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`,
  );
}

/**
 * Replaces the global `fetch`; undo with `vi.unstubAllGlobals()`.
 */
export function stubFetch(
  createResponse: () => Response = () => Response.json({}),
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async () => createResponse());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/**
 * Replaces the global `fetch` with the API's side of a multipart upload: the upload id on its start, each part's number
 * in its etag, `E_UPLOAD_INCOMPLETE` for the failed part, `E_NOT_FOUND` on its deletion and the completed body on its completion.
 */
export function stubMultipartUploadFetch(
  completedBody: unknown,
  failedPartNumber?: number,
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const { pathname } = new URL(String(input));
    const partNumber = Number(/\/parts\/(\d+)$/.exec(pathname)?.[1]);
    if (init?.method === 'DELETE') {
      return Response.json(
        { code: 'E_NOT_FOUND', message: 'The upload does not exist.' },
        { status: 404 },
      );
    }
    if (init?.method === 'PUT' && partNumber === failedPartNumber) {
      return Response.json(
        { code: 'E_UPLOAD_INCOMPLETE', message: 'The part was refused.' },
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
