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
import { BundleDeltasResource } from './bundle-deltas';
import { BundleExpoManifestResource } from './bundle-expo-manifest';
import { BundleFilesResource } from './bundle-files';
import { BundlePackResource } from './bundle-pack';

export type Bundle = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}',
  'get',
  200
>;

/**
 * A created bundle with the upload URLs of the files the app lacks and of its pack.
 */
export type BundleWithUploads = JsonResponseBody<
  '/v1/apps/{appId}/bundles',
  'post',
  201
>;

export type CompleteBundleOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/complete',
  'post'
>;

export type CountBundlesOptions = PathParameters<
  '/v1/apps/{appId}/bundles/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles/count', 'get'>;

export type CreateBundleOptions = PathParameters<
  '/v1/apps/{appId}/bundles',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/bundles', 'post'> &
  IdempotencyOptions;

export type DeleteBundleOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}',
  'delete'
>;

export type GetBundleOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}',
  'get'
>;

export type ListBundlesOptions = PathParameters<
  '/v1/apps/{appId}/bundles',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/bundles', 'get'>;

export class BundlesResource {
  public readonly deltas: BundleDeltasResource;
  public readonly expoManifest: BundleExpoManifestResource;
  public readonly files: BundleFilesResource;
  public readonly pack: BundlePackResource;

  constructor(private readonly httpClient: HttpClient) {
    this.deltas = new BundleDeltasResource(httpClient);
    this.expoManifest = new BundleExpoManifestResource(httpClient);
    this.files = new BundleFilesResource(httpClient);
    this.pack = new BundlePackResource(httpClient);
  }

  /**
   * Checks every listed file, the pack and the delta packs are uploaded, writes the manifest and sets the bundle `ready`.
   * A completed bundle answers itself again, so the call is retried.
   */
  public async complete(options: CompleteBundleOptions): Promise<Bundle> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/complete',
        options,
      ),
    });
  }

  /**
   * The number of the app's bundles under the list's filters.
   */
  public async count(options: CountBundlesOptions): Promise<Count> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles/count', { appId }),
      query,
    });
  }

  /**
   * Creates a bundle from its manifest; it stays `uploading` until completed.
   */
  public async create(
    options: CreateBundleOptions,
  ): Promise<BundleWithUploads> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/bundles', { appId }),
    });
  }

  /**
   * Deletes a bundle now; one a release serves or a store build embeds is refused.
   */
  public async delete(options: DeleteBundleOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}', options),
    });
  }

  public async get(options: GetBundleOptions): Promise<Bundle> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}', options),
    });
  }

  /**
   * The app's uploaded bundles, newest first.
   */
  public async list(options: ListBundlesOptions): Promise<Bundle[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/bundles', { appId }),
      query,
    });
  }
}
