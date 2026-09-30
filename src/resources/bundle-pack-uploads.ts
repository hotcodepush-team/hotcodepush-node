import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  IdempotencyOptions,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import type { UploadedBundlePack } from './bundle-pack';
import { BundlePackUploadPartsResource } from './bundle-pack-upload-parts';

export type BundlePackUpload = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads',
  'post',
  201
>;

export type CompleteBundlePackUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}/complete',
  'post'
> &
  JsonRequestBody<
    '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}/complete',
    'post'
  >;

export type CreateBundlePackUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads',
  'post'
> &
  IdempotencyOptions;

export type DeleteBundlePackUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}',
  'delete'
>;

/**
 * The multipart upload of a pack above the request body limit: create, upload the parts, complete, or delete to abort.
 */
export class BundlePackUploadsResource {
  public readonly parts: BundlePackUploadPartsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.parts = new BundlePackUploadPartsResource(httpClient);
  }

  /**
   * Assembles the parts into the pack, replacing one uploaded before.
   */
  public async complete(
    options: CompleteBundlePackUploadOptions,
  ): Promise<UploadedBundlePack> {
    const { appId, bundleId, uploadId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}/complete',
        { appId, bundleId, uploadId },
      ),
    });
  }

  /**
   * Starts a multipart upload of the pack; every part but the last is at least five mebibytes, all of one size.
   */
  public async create(
    options: CreateBundlePackUploadOptions,
  ): Promise<BundlePackUpload> {
    const { idempotencyKey, ...pathParameters } = options;
    return this.httpClient.fetchCreatingPost({
      idempotencyKey,
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads',
        pathParameters,
      ),
    });
  }

  /**
   * Aborts a multipart pack upload, discarding its parts.
   */
  public async delete(options: DeleteBundlePackUploadOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}',
        options,
      ),
    });
  }
}
