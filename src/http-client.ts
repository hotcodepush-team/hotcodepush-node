import { version } from '../package.json';
import { resolveHotCodePushError } from './errors';
import type { paths } from './generated/schema';
import type { BlobUploadBody, IdempotencyOptions, UploadBody } from './types';

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
/**
 * Ten minutes per attempt: `SINGLE_UPLOAD_LIMIT_BYTES`, the largest `Blob` sent in one request, at about a hundred kilobytes a second.
 */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

export interface FetchCreatingPostOptions extends IdempotencyOptions {
  body?: unknown;
  path: string;
}

export interface FetchJsonOptions {
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Whether a failed attempt is sent again; a `POST` sets it where the API makes a repeat safe,
   * through a stored idempotency key or a transition that answers a repeat unchanged.
   *
   * @default true for `DELETE`, `GET` and `PUT`, false for `PATCH` and `POST`
   */
  isRetryable?: boolean;
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';
  path: string;
  /**
   * Undefined values and empty lists are left out; a list is sent as a comma list.
   */
  query?: Record<string, number | readonly string[] | string | undefined>;
}

export type FetchUploadOptions = UploadBody & {
  contentType: string;
  path: string;
};

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

  /**
   * A request answered with a binary body, such as a channel's QR image, read whole.
   */
  public async fetchBlob(options: FetchJsonOptions): Promise<Blob> {
    const response = await this.fetchResponse(options);
    await assertResponseOk(response);
    return response.blob();
  }

  /**
   * A creating `POST`, sent with an `Idempotency-Key`: the caller's, or one generated for this call and kept across its retries,
   * which the API answers with the first result.
   */
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

  /**
   * A request whose status is the whole answer: the body, such as `/health`'s plain-text `ok`, is discarded.
   */
  public async fetchStatus(options: FetchJsonOptions): Promise<void> {
    const response = await this.fetchResponse(options);
    await assertResponseOk(response);
    await response.body?.cancel();
  }

  /**
   * A binary `PUT`, streamed as it is read; a stream is read once, so only a `Blob` is retried.
   */
  public async fetchUpload<T>(options: FetchUploadOptions): Promise<T> {
    const fetchWithTimeout = withTimeout(fetch, UPLOAD_TIMEOUT_MS);
    const fetchFunction = isBlobUploadBody(options)
      ? withRetry(fetchWithTimeout)
      : fetchWithTimeout;
    const contentLength = isBlobUploadBody(options)
      ? options.body.size
      : options.contentLength;
    const response = await fetchFunction(new URL(options.path, this.baseUrl), {
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
    const fetchWithTimeout = withTimeout(fetch, JSON_TIMEOUT_MS);
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

  private resolveUrl(options: FetchJsonOptions): URL {
    const url = new URL(options.path, this.baseUrl);
    for (const [name, value] of Object.entries(options.query ?? {})) {
      const queryValue = typeof value === 'object' ? value.join(',') : value;
      if (queryValue !== undefined && queryValue !== '') {
        url.searchParams.set(name, String(queryValue));
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
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  return headers;
}

/**
 * Fills a path template of the OpenAPI snapshot, `/v1/apps/{appId}`, with its encoded parameters;
 * a template the document lacks does not compile.
 */
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
