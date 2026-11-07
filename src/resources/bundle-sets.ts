import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The bundles of one change, one per platform it covers, which a release points at.
 */
export type BundleSet = JsonResponseBody<
  '/v1/apps/{appId}/bundle-sets/{bundleSetId}',
  'get',
  200
>;

export type CountBundleSetsOptions = PathParameters<
  '/v1/apps/{appId}/bundle-sets/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundle-sets/count', 'get'>;

export type CreateBundleSetOptions = PathParameters<
  '/v1/apps/{appId}/bundle-sets',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/bundle-sets', 'post'>;

export type GetBundleSetOptions = PathParameters<
  '/v1/apps/{appId}/bundle-sets/{bundleSetId}',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundle-sets/{bundleSetId}', 'get'>;

export type ListBundleSetsOptions = PathParameters<
  '/v1/apps/{appId}/bundle-sets',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundle-sets', 'get'>;

export class BundleSetsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the bundle sets of the app that match the filters.
   */
  public async count(options: CountBundleSetsOptions): Promise<Count> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundle-sets/count', { appId }),
      query,
    });
  }

  /**
   * Finds the set of exactly these ready bundles, one per platform, or creates it with the next number of the app.
   * A set the app already holds answers it unchanged, so the client retries the call.
   */
  public async create(options: CreateBundleSetOptions): Promise<BundleSet> {
    const { appId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      isRetryable: true,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/bundle-sets', { appId }),
    });
  }

  public async get(options: GetBundleSetOptions): Promise<BundleSet> {
    const { appId, bundleSetId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundle-sets/{bundleSetId}', {
        appId,
        bundleSetId,
      }),
      query,
    });
  }

  /**
   * Lists the bundle sets of the app, newest first.
   * `bundleId` selects the sets that carry the bundle, and `platform` the sets that cover it.
   */
  public async list(options: ListBundleSetsOptions): Promise<BundleSet[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundle-sets', { appId }),
      query,
    });
  }
}
