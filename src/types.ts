import type { components, paths } from './generated/schema';

export interface ErrorBody {
  code: HotCodePushErrorCode;
  details?: unknown;
  message: string;
}

/**
 * An upload body that a retry can read again. Its size is sent as `Content-Length`.
 * `fs.openAsBlob(path)` streams a file from disk this way.
 */
export interface BlobUploadBody {
  body: Blob;
}

/**
 * The answer of every `count` method: the number of rows that match the filters.
 */
export type Count = JsonResponseBody<'/v1/organizations/count', 'get', 200>;

/**
 * A code from the API error catalog, or `unexpected_response` for a response without the API error shape.
 * Such a response can come from the platform in front of the API. `internal` means the API itself failed.
 */
export type HotCodePushErrorCode =
  components['schemas']['Error']['code'] | 'unexpected_response';

export interface IdempotencyOptions {
  /**
   * The `Idempotency-Key` header. The API keeps it for 24 hours, so a retried call gets the first result back instead of creating a second one.
   *
   * @default a UUID generated per call and sent on each of its attempts
   */
  idempotencyKey?: string;
}

/**
 * An upload body that is read once as it streams and never retried.
 * The API requires its `contentLength`.
 */
export interface StreamUploadBody {
  body: ReadableStream<Uint8Array>;
  contentLength: number;
}

/**
 * The binary body of an upload, streamed and never buffered.
 */
export type UploadBody = BlobUploadBody | StreamUploadBody;

type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

type Operation<
  TPath extends keyof paths,
  TMethod extends HttpMethod,
> = NonNullable<paths[TPath][TMethod]>;

export type JsonRequestBody<
  TPath extends keyof paths,
  TMethod extends HttpMethod,
> =
  NonNullable<Operation<TPath, TMethod>['requestBody']> extends {
    content: { 'application/json': infer TBody };
  }
    ? TBody
    : never;

export type JsonResponseBody<
  TPath extends keyof paths,
  TMethod extends HttpMethod,
  TStatus extends number,
> =
  Operation<TPath, TMethod>['responses'] extends Record<
    TStatus,
    { content: { 'application/json': infer TBody } }
  >
    ? TBody
    : never;

export type PathParameters<
  TPath extends keyof paths,
  TMethod extends HttpMethod,
> = Operation<TPath, TMethod>['parameters']['path'];

export type QueryParameters<
  TPath extends keyof paths,
  TMethod extends HttpMethod,
> = NonNullable<Operation<TPath, TMethod>['parameters']['query']>;
