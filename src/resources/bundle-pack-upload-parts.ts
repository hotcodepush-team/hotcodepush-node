import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, UploadBody } from '../types';
import type { UploadedPart } from './file-upload-parts';

export type UploadBundlePackPartOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}/parts/{partNumber}',
  'put'
> &
  UploadBody;

export class BundlePackUploadPartsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Uploads one part of a multipart pack upload.
   * Pass the answered `etag` and `partNumber` to `complete`.
   */
  public async upload(
    options: UploadBundlePackPartOptions,
  ): Promise<UploadedPart> {
    const { appId, bundleId, partNumber, uploadId, ...uploadBody } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/x-tar',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/pack/uploads/{uploadId}/parts/{partNumber}',
        { appId, bundleId, partNumber, uploadId },
      ),
    });
  }
}
