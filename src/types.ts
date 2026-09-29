import type { paths } from './generated/schema';

/**
 * The one error shape every API error answers with.
 */
export interface ErrorBody {
  code: string;
  details?: unknown;
  message: string;
}

export interface IdempotencyOptions {
  /**
   * The `Idempotency-Key` header, kept by the API for 24 hours, so a retried call gets the same result back instead of a second one.
   *
   * @default a UUID generated per call and sent on each of its attempts
   */
  idempotencyKey?: string;
}

type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

/**
 * An operation of the OpenAPI snapshot: a path or a method the document lacks does not compile.
 */
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
