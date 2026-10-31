import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
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
>;

export type DeleteBundlePackUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}',
  'delete'
>;

/**
 * Uploads a pack above the request body limit in parts.
 * Create the upload, upload the parts and complete it, or delete it to abort.
 */
export class BundlePackUploadsResource {
  public readonly parts: BundlePackUploadPartsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.parts = new BundlePackUploadPartsResource(httpClient);
  }

  /**
   * Assembles the parts into the pack and replaces any pack uploaded before.
   * R2 refuses a second completion, so the client never retries the call.
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
   * Starts a multipart upload of the pack.
   * Every part but the last must have the same size of at least five mebibytes.
   * The start holds no state, and an unused upload expires on its own, so the client retries the call.
   */
  public async create(
    options: CreateBundlePackUploadOptions,
  ): Promise<BundlePackUpload> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads',
        options,
      ),
    });
  }

  /**
   * Aborts a multipart pack upload and discards its parts.
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
