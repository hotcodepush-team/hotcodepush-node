import { version } from '../package.json';
import { resolveHotCodePushError } from './errors';

const DEFAULT_BASE_URL = 'https://api.hotcodepush.com';
const DEFAULT_CLIENT = `node/${version}`;
const INITIAL_RETRY_DELAY_MS = 500;
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 60_000;

export interface FetchJsonOptions {
  body?: unknown;
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  path: string;
}

export interface HttpClientOptions {
  /**
   * The base URL of the API.
   *
   * @default 'https://api.hotcodepush.com'
   */
  baseUrl?: string;
  /**
   * The `X-HotCodePush-Client` header, `<name>/<version>`.
   *
   * @default 'node/<the version of this package>'
   */
  client?: string;
  /**
   * The API token, sent as `Authorization: Bearer <token>`.
   */
  token?: string;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.headers = resolveHeaders(options);
  }

  public async fetchJson<T>(options: FetchJsonOptions): Promise<T> {
    const fetchWithRetryAndTimeout = withRetry(withTimeout(fetch, TIMEOUT_MS));
    const url = new URL(options.path, this.baseUrl);
    const requestInit = this.resolveRequestInit(options);
    const response = await fetchWithRetryAndTimeout(url, requestInit);
    const text = await response.text();
    if (!response.ok) {
      throw resolveHotCodePushError(response.status, text);
    }
    return (text ? JSON.parse(text) : undefined) as T;
  }

  private resolveRequestInit(options: FetchJsonOptions): RequestInit {
    if (options.body === undefined) {
      return { headers: this.headers, method: options.method };
    }
    return {
      body: JSON.stringify(options.body),
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      method: options.method,
    };
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

function resolveHeaders(options: HttpClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-HotCodePush-Client': options.client ?? DEFAULT_CLIENT,
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return headers;
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function withRetry(fetchFunction: typeof fetch): typeof fetch {
  return async (input, init) => {
    for (let attempt = 1; ; attempt++) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      try {
        const response = await fetchFunction(input, init);
        if (isLastAttempt || !isRetryableStatus(response.status)) {
          return response;
        }
        await response.body?.cancel();
      } catch (error) {
        if (isLastAttempt) {
          throw error;
        }
      }
      await sleep(INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1));
    }
  };
}

export function withTimeout(
  fetchFunction: typeof fetch,
  timeoutMs: number,
): typeof fetch {
  return (input, init) =>
    fetchFunction(input, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
