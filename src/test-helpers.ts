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
 * Replaces the global `fetch`; undo with `vi.unstubAllGlobals()`.
 */
export function stubFetch(
  createResponse: () => Response = () => Response.json({}),
): Mock<typeof fetch> {
  const fetchMock = vi.fn<typeof fetch>(async () => createResponse());
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
