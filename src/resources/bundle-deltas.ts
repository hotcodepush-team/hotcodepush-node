import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A delta of a bundle against one base bundle.
 * Its size and patch count are known once it is built.
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
   * Counts the deltas of the bundle.
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
   * Lists the deltas of the bundle, newest first, one per base bundle that its devices run.
   * `relations: ['baseBundle']` embeds the base bundle.
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
