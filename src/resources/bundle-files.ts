import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A file listed in a bundle: its path, the SHA-256 of its content and its uncompressed size.
 * `storedAt` is when the app stored that hash.
 */
export type BundleFile = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/files',
  'get',
  200
>[number];

export type CountBundleFilesOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/files/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles/{bundleId}/files/count', 'get'>;

export type ListBundleFilesOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/files',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles/{bundleId}/files', 'get'>;

export class BundleFilesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the files of the bundle that match the filters.
   */
  public async count(options: CountBundleFilesOptions): Promise<Count> {
    const { appId, bundleId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}/files/count', {
        appId,
        bundleId,
      }),
      query,
    });
  }

  /**
   * Lists the files of the bundle, ordered by path.
   * An embedded bundle answers the files its binary was created with.
   * After creating a bundle, `isStored: 'false'` selects the files still to upload.
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
