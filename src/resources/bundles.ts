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
import { BundleFilesResource } from './bundle-files';
import { BundlePackResource } from './bundle-pack';

export type Bundle = JsonResponseBody<
  '/v1/apps/{appId}/bundles',
  'get',
  200
>[number];

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
  public readonly files: BundleFilesResource;
  public readonly pack: BundlePackResource;

  constructor(private readonly httpClient: HttpClient) {
    this.deltas = new BundleDeltasResource(httpClient);
    this.files = new BundleFilesResource(httpClient);
    this.pack = new BundlePackResource(httpClient);
  }

  /**
   * Completes a bundle: checks that every listed file and the pack are uploaded, writes the manifest and sets the status to `ready`.
   * A completed bundle answers itself again, so the client retries the call.
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
   * Counts the bundles of the app that match the filters.
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
   * Creates a bundle from its manifest. It stays `uploading` until completed.
   * Find the files the app lacks with `apps.bundles.files.list` and `isStored: 'false'`, and upload each through `apps.files.upload`.
   * Upload the pack through `apps.bundles.pack.upload`.
   */
  public async create(options: CreateBundleOptions): Promise<Bundle> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/bundles', { appId }),
    });
  }

  /**
   * Deletes a bundle at once.
   * A bundle that a release serves or a store build embeds is refused.
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
   * Lists the uploaded bundles of the app, newest first.
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
