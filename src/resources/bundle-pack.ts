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
   * Uploads the bundle's full pack, a tar, before the bundle is completed.
   * A `Blob` above `SINGLE_UPLOAD_LIMIT_BYTES` goes up in parts; a stream goes up in one request, so it stays within the limit.
   */
  public async upload(
    options: UploadBundlePackOptions,
  ): Promise<UploadedBundlePack> {
    const { appId, bundleId, ...uploadBody } = options;
    if (isBlobAboveSingleUploadLimit(uploadBody)) {
      return uploadInParts(this.uploads, { appId, bundleId }, uploadBody.body);
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
