import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A store build `binary create` registered, with the bundle it ships and the devices running it.
 */
export type Binary = JsonResponseBody<
  '/v1/apps/{appId}/binaries/{binaryId}',
  'get',
  200
>;

export type CountBinariesOptions = PathParameters<
  '/v1/apps/{appId}/binaries/count',
  'get'
>;

export type CreateBinaryOptions = PathParameters<
  '/v1/apps/{appId}/binaries',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/binaries', 'post'> &
  IdempotencyOptions;

export type GetBinaryOptions = PathParameters<
  '/v1/apps/{appId}/binaries/{binaryId}',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/binaries/{binaryId}', 'get'>;

export type ListBinariesOptions = PathParameters<
  '/v1/apps/{appId}/binaries',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/binaries', 'get'>;

export class BinariesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the app's registered store builds.
   */
  public async count(options: CountBinariesOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/binaries/count', options),
    });
  }

  /**
   * Registers a store build on its identity with the bundle compiled into it, its files uploaded first.
   * An identical registration answers the existing one; a conflicting fingerprint or file set is refused unless `force` is set.
   */
  public async create(options: CreateBinaryOptions): Promise<Binary> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/binaries', { appId }),
    });
  }

  public async get(options: GetBinaryOptions): Promise<Binary> {
    const { appId, binaryId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/binaries/{binaryId}', {
        appId,
        binaryId,
      }),
      query,
    });
  }

  /**
   * The app's registered store builds, newest first.
   */
  public async list(options: ListBinariesOptions): Promise<Binary[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/binaries', { appId }),
      query,
    });
  }
}
