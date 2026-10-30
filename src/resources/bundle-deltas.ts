import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A delta of a bundle against one base, its size and patch count known once built.
 */
export type BundleDelta = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas',
  'get',
  200
>[number];

export type CountBundleDeltasOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/count',
  'get'
>;

export type ListBundleDeltasOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles/{bundleId}/deltas', 'get'>;

export class BundleDeltasResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the bundle's deltas.
   */
  public async count(options: CountBundleDeltasOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/count',
        options,
      ),
    });
  }

  /**
   * The bundle's deltas, one per base its devices run, newest first; `relations: ['baseBundle']` embeds the base.
   */
  public async list(options: ListBundleDeltasOptions): Promise<BundleDelta[]> {
    const { appId, bundleId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}/deltas', {
        appId,
        bundleId,
      }),
      query,
    });
  }
}
