import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters, UploadBody } from '../types';
import { FileUploadsResource } from './file-uploads';

/**
 * A content-addressed file of the app, shared between its bundles.
 */
export type AppFile = JsonResponseBody<
  '/v1/apps/{appId}/files/{sha256}',
  'put',
  201
>;

export type UploadFileOptions = PathParameters<
  '/v1/apps/{appId}/files/{sha256}',
  'put'
> &
  UploadBody;

export class FilesResource {
  public readonly uploads: FileUploadsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.uploads = new FileUploadsResource(httpClient);
  }

  /**
   * Uploads one file: the body is the file gzip-compressed and `sha256` the hash of its uncompressed content.
   * A hash the app already holds answers the existing file.
   */
  public async upload(options: UploadFileOptions): Promise<AppFile> {
    const { appId, sha256, ...uploadBody } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/gzip',
      path: resolvePath('/v1/apps/{appId}/files/{sha256}', { appId, sha256 }),
    });
  }
}
