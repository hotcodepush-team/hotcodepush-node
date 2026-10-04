import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A file a bundle lists: its path, the sha256 of its content and its uncompressed size.
 */
export type BundleFile = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/files',
  'get',
  200
>[number];

export type CountBundleFilesOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/files/count',
  'get'
>;

export type ListBundleFilesOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/files',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles/{bundleId}/files', 'get'>;

export class BundleFilesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of files the bundle lists.
   */
  public async count(options: CountBundleFilesOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/files/count',
        options,
      ),
    });
  }

  /**
   * The bundle's files, ordered by path; an embedded bundle answers the files its binary registered.
   */
  public async list(options: ListBundleFilesOptions): Promise<BundleFile[]> {
    const { appId, bundleId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}/files', {
        appId,
        bundleId,
      }),
      query,
    });
  }
}
