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

export type CountEmbeddedBundlesOptions = PathParameters<
  '/v1/apps/{appId}/embedded-bundles/count',
  'get'
>;

export type CreateEmbeddedBundleOptions = PathParameters<
  '/v1/apps/{appId}/embedded-bundles',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/embedded-bundles', 'post'> &
  IdempotencyOptions;

export type EmbeddedBundle = JsonResponseBody<
  '/v1/apps/{appId}/embedded-bundles/{embeddedBundleId}',
  'get',
  200
>;

export type GetEmbeddedBundleOptions = PathParameters<
  '/v1/apps/{appId}/embedded-bundles/{embeddedBundleId}',
  'get'
> &
  QueryParameters<
    '/v1/apps/{appId}/embedded-bundles/{embeddedBundleId}',
    'get'
  >;

export type ListEmbeddedBundlesOptions = PathParameters<
  '/v1/apps/{appId}/embedded-bundles',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/embedded-bundles', 'get'>;

export class EmbeddedBundlesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the app's registered store builds.
   */
  public async count(options: CountEmbeddedBundlesOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/embedded-bundles/count', options),
    });
  }

  /**
   * Registers the bundle compiled into a store build on its binary identity, its files uploaded first.
   * An identical registration answers the existing one; a conflicting fingerprint is refused unless `force` is set.
   */
  public async create(
    options: CreateEmbeddedBundleOptions,
  ): Promise<EmbeddedBundle> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/embedded-bundles', { appId }),
    });
  }

  public async get(options: GetEmbeddedBundleOptions): Promise<EmbeddedBundle> {
    const { appId, embeddedBundleId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/embedded-bundles/{embeddedBundleId}',
        { appId, embeddedBundleId },
      ),
      query,
    });
  }

  /**
   * The app's registered store builds, newest first.
   */
  public async list(
    options: ListEmbeddedBundlesOptions,
  ): Promise<EmbeddedBundle[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/embedded-bundles', { appId }),
      query,
    });
  }
}
