import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, UploadBody } from '../types';
import type { UploadedPart } from './file-upload-parts';

export type UploadBundleDeltaPartOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}/parts/{partNumber}',
  'put'
> &
  UploadBody;

export class BundleDeltaUploadPartsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Uploads one part of a multipart delta pack upload; its `etag` and `partNumber` complete the upload.
   */
  public async upload(
    options: UploadBundleDeltaPartOptions,
  ): Promise<UploadedPart> {
    const {
      appId,
      baseBundleId,
      bundleId,
      partNumber,
      uploadId,
      ...uploadBody
    } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/x-tar',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}/uploads/{uploadId}/parts/{partNumber}',
        { appId, baseBundleId, bundleId, partNumber, uploadId },
      ),
    });
  }
}
