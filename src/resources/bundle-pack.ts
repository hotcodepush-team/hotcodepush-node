import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters, UploadBody } from '../types';
import {
  isBlobAboveSingleUploadLimit,
  uploadInParts,
} from '../upload-in-parts';
import { BundlePackUploadsResource } from './bundle-pack-uploads';

export type UploadBundlePackOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack',
  'put'
> &
  UploadBody;

export type UploadedBundlePack = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/pack',
  'put',
  200
>;

export class BundlePackResource {
  public readonly uploads: BundlePackUploadsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.uploads = new BundlePackUploadsResource(httpClient);
  }

  /**
   * Uploads the full pack of the bundle, a tar, before the bundle is completed.
   * A `Blob` above `SINGLE_UPLOAD_LIMIT_BYTES` goes up in parts. A stream goes up in one request, so it must stay within that limit.
   */
  public async upload(
    options: UploadBundlePackOptions,
  ): Promise<UploadedBundlePack> {
    const { appId, bundleId, ...uploadBody } = options;
    if (isBlobAboveSingleUploadLimit(uploadBody)) {
      return uploadInParts(this.uploads, {
        blob: uploadBody.body,
        pathParameters: { appId, bundleId },
      });
    }
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/x-tar',
      path: resolvePath('/v1/apps/{appId}/bundles/{bundleId}/pack', {
        appId,
        bundleId,
      }),
    });
  }
}
