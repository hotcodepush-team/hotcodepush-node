import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import { BundleDeltaUploadPartsResource } from './bundle-delta-upload-parts';
import type { UploadedBundleDelta } from './bundle-deltas';

export type BundleDeltaUpload = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads',
  'post',
  201
>;

export type CompleteBundleDeltaUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}/complete',
  'post'
> &
  JsonRequestBody<
    '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}/complete',
    'post'
  >;

export type CreateBundleDeltaUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads',
  'post'
>;

export type DeleteBundleDeltaUploadOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}',
  'delete'
>;

/**
 * The multipart upload of a delta pack above the request body limit: create, upload the parts, complete, or delete to abort.
 */
export class BundleDeltaUploadsResource {
  public readonly parts: BundleDeltaUploadPartsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.parts = new BundleDeltaUploadPartsResource(httpClient);
  }

  /**
   * Assembles the parts into the delta pack, replacing one uploaded before.
   * R2 refuses a second completion, so the call is never retried.
   */
  public async complete(
    options: CompleteBundleDeltaUploadOptions,
  ): Promise<UploadedBundleDelta> {
    const { appId, baseBundleId, bundleId, uploadId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}/complete',
        { appId, baseBundleId, bundleId, uploadId },
      ),
    });
  }

  /**
   * Starts a multipart upload of the delta pack from a base bundle of the app; every part but the last is at least five mebibytes, all of one size.
   * The API keeps no idempotency key for it, so the call is never retried: a repeat would start a second upload.
   */
  public async create(
    options: CreateBundleDeltaUploadOptions,
  ): Promise<BundleDeltaUpload> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads',
        options,
      ),
    });
  }

  /**
   * Aborts a multipart delta pack upload, discarding its parts.
   */
  public async delete(options: DeleteBundleDeltaUploadOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}',
        options,
      ),
    });
  }
}
