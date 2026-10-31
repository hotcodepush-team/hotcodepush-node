import { version } from '../package.json';
import { resolveHotCodePushError } from './errors';
import type { paths } from './generated/schema';
import type { BlobUploadBody, IdempotencyOptions, UploadBody } from './types';

const COMMA_LIST_QUERY_NAMES: ReadonlySet<string> = new Set([
  'ids',
  'relations',
]);
const DEFAULT_BASE_URL = 'https://api.hotcodepush.com';
const DEFAULT_CLIENT = `node/${version}`;
const IDEMPOTENT_METHODS: ReadonlySet<FetchJsonOptions['method']> = new Set([
  'DELETE',
  'GET',
  'PUT',
]);
const INITIAL_RETRY_DELAY_MS = 500;
const JSON_TIMEOUT_MS = 60_000;
const MAX_ATTEMPTS = 3;
// The API rate limits use sixty-second windows, so a longer wait is never needed.
const MAX_RETRY_AFTER_MS = 60_000;
const RETRY_AFTER_STATUSES: ReadonlySet<number> = new Set([429, 503]);
const TOKEN_ENVIRONMENT_VARIABLE = 'HOTCODEPUSH_TOKEN';
// Enough for a Blob of SINGLE_UPLOAD_LIMIT_BYTES at about 100 KB per second.
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

export interface FetchCreatingPostOptions extends IdempotencyOptions {
  body?: unknown;
  path: string;
}

export interface FetchJsonOptions {
  body?: unknown;
  headers?: Record<string, string>;
  // Set on a POST only where a repeat is safe: through a stored idempotency key,
  // or a transition that answers a repeat unchanged.
  isRetryable?: boolean;
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  path: string;
  query?: Record<string, QueryValue>;
}

export type FetchUploadOptions = UploadBody & {
  contentType: string;
  path: string;
};

export interface HttpClientOptions {
  /**
   * The base URL of the API. A path in it, such as that of a proxy, prefixes every route.
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
   * The milliseconds each attempt of a JSON call may take. A binary upload gets ten minutes per attempt.
   *
   * @default 60_000
   */
  timeout?: number;
  /**
   * The API token, sent as `Authorization: Bearer <token>`.
   *
   * @default the `HOTCODEPUSH_TOKEN` environment variable
   */
  token?: string;
  /**
   * The `User-Agent` header, `<name>/<version>`.
   * Sessions keep it, so the sessions page and the new sign-in mail name the client by it.
   *
   * @default the one the runtime's `fetch` sends
   */
  userAgent?: string;
}

type QueryValue = boolean | number | readonly string[] | string | undefined;

export class HttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;

  constructor(options: HttpClientOptions) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    this.headers = resolveHeaders(options);
    this.timeoutMs = options.timeout ?? JSON_TIMEOUT_MS;
  }

  public async fetchBlob(options: FetchJsonOptions): Promise<Blob> {
    const response = await this.fetchResponse(options);
    await assertResponseOk(response);
    return response.blob();
  }

  // The key stays the same across retries, so the API answers a repeat with the first result.
  public async fetchCreatingPost<T>(
    options: FetchCreatingPostOptions,
  ): Promise<T> {
    return this.fetchJson({
      body: options.body,
      headers: {
        'Idempotency-Key': options.idempotencyKey ?? crypto.randomUUID(),
      },
      isRetryable: true,
      method: 'POST',
      path: options.path,
    });
  }

  public async fetchJson<T>(options: FetchJsonOptions): Promise<T> {
    const response = await this.fetchResponse(options);
    return parseResponseBody(response);
  }

  public async fetchStatus(options: FetchJsonOptions): Promise<void> {
    const response = await this.fetchResponse(options);
    await assertResponseOk(response);
    await response.body?.cancel();
  }

  public async fetchUpload<T>(options: FetchUploadOptions): Promise<T> {
    const fetchWithTimeout = withTimeout(fetch, UPLOAD_TIMEOUT_MS);
    // A stream is read once, so only a Blob upload is retried.
    const fetchFunction = isBlobUploadBody(options)
      ? withRetry(fetchWithTimeout)
      : fetchWithTimeout;
    const contentLength = isBlobUploadBody(options)
      ? options.body.size
      : options.contentLength;
    const response = await fetchFunction(this.resolveRouteUrl(options.path), {
      body: options.body,
      duplex: 'half',
      headers: {
        ...this.headers,
        'Content-Length': String(contentLength),
        'Content-Type': options.contentType,
      },
      method: 'PUT',
    });
    return parseResponseBody(response);
  }

  private async fetchResponse(options: FetchJsonOptions): Promise<Response> {
    const fetchWithTimeout = withTimeout(fetch, this.timeoutMs);
    const isRetryable =
      options.isRetryable ?? IDEMPOTENT_METHODS.has(options.method);
    const fetchFunction = isRetryable
      ? withRetry(fetchWithTimeout)
      : fetchWithTimeout;
    const url = this.resolveUrl(options);
    const requestInit = this.resolveRequestInit(options);
    return fetchFunction(url, requestInit);
  }

  private resolveRequestInit(options: FetchJsonOptions): RequestInit {
    const headers = { ...this.headers, ...options.headers };
    if (options.body === undefined) {
      return { headers, method: options.method };
    }
    return {
      body: JSON.stringify(options.body),
      headers: { ...headers, 'Content-Type': 'application/json' },
      method: options.method,
    };
  }

  // Concatenated, since `new URL('/v1/…', base)` would drop the path of the base URL.
  private resolveRouteUrl(path: string): URL {
    return new URL(this.baseUrl + path);
  }

  private resolveUrl(options: FetchJsonOptions): URL {
    const url = this.resolveRouteUrl(options.path);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      for (const queryValue of resolveQueryValues(name, value)) {
        url.searchParams.append(name, queryValue);
      }
    }
    return url;
  }
}

async function assertResponseOk(response: Response): Promise<void> {
  if (!response.ok) {
    throw resolveHotCodePushError(response.status, await response.text());
  }
}

function isBlobUploadBody(
  uploadBody: UploadBody,
): uploadBody is BlobUploadBody {
  return uploadBody.body instanceof Blob;
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

async function parseResponseBody<T>(response: Response): Promise<T> {
  await assertResponseOk(response);
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

function resolveHeaders(options: HttpClientOptions): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-HotCodePush-Client': options.client ?? DEFAULT_CLIENT,
  };
  const token = options.token || process.env[TOKEN_ENVIRONMENT_VARIABLE];
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (options.userAgent) {
    headers['User-Agent'] = options.userAgent;
  }
  return headers;
}

export function resolvePath(
  template: keyof paths,
  parameters: Record<string, number | string> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_placeholder, name: string) => {
    const parameter = parameters[name];
    if (parameter === undefined) {
      throw new Error(`The path parameter ${name} of ${template} is missing.`);
    }
    return encodeURIComponent(parameter);
  });
}

// The API reads `ids` and `relations` as comma lists. Other lists repeat their parameter,
// since their values may hold a comma.
function resolveQueryValues(name: string, value: QueryValue): string[] {
  if (value === undefined || value === '') {
    return [];
  }
  if (typeof value !== 'object') {
    return [String(value)];
  }
  if (COMMA_LIST_QUERY_NAMES.has(name)) {
    return value.length === 0 ? [] : [value.join(',')];
  }
  return [...value];
}

// `Retry-After` holds either delay seconds or an HTTP date (RFC 9110).
function resolveRetryAfterMs(response: Response): number | undefined {
  const retryAfter = response.headers.get('Retry-After')?.trim();
  if (!RETRY_AFTER_STATUSES.has(response.status) || !retryAfter) {
    return undefined;
  }
  const retryAfterMs = /^\d+$/.test(retryAfter)
    ? Number(retryAfter) * 1000
    : Date.parse(retryAfter) - Date.now();
  if (Number.isNaN(retryAfterMs)) {
    return undefined;
  }
  return Math.min(Math.max(retryAfterMs, 0), MAX_RETRY_AFTER_MS);
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function withRetry(fetchFunction: typeof fetch): typeof fetch {
  return async (input, init) => {
    for (let attempt = 1; ; attempt++) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      let retryAfterMs: number | undefined;
      try {
        const response = await fetchFunction(input, init);
        if (isLastAttempt || !isRetryableStatus(response.status)) {
          return response;
        }
        await response.body?.cancel();
        retryAfterMs = resolveRetryAfterMs(response);
      } catch (error) {
        if (isLastAttempt) {
          throw error;
        }
      }
      await sleep(retryAfterMs ?? INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1));
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
