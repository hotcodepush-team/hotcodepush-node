import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters, UploadBody } from '../types';

export type UploadedPart = JsonResponseBody<
  '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/parts/{partNumber}',
  'put',
  200
>;

export type UploadPartOptions = PathParameters<
  '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/parts/{partNumber}',
  'put'
> &
  UploadBody;

export class FileUploadPartsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Uploads one part of a multipart upload; its `etag` and `partNumber` complete the upload.
   */
  public async upload(options: UploadPartOptions): Promise<UploadedPart> {
    const { appId, partNumber, sha256, uploadId, ...uploadBody } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/gzip',
      path: resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/parts/{partNumber}',
        { appId, partNumber, sha256, uploadId },
      ),
    });
  }
}
