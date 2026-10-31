import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import { FileUploadPartsResource } from './file-upload-parts';
import type { AppFile } from './files';

export type CompleteFileUploadOptions = PathParameters<
  '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/complete',
  'post'
> &
  JsonRequestBody<
    '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/complete',
    'post'
  >;

export type CreateFileUploadOptions = PathParameters<
  '/v1/apps/{appId}/files/{sha256}/uploads',
  'post'
>;

export type DeleteFileUploadOptions = PathParameters<
  '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}',
  'delete'
>;

export type FileUpload = JsonResponseBody<
  '/v1/apps/{appId}/files/{sha256}/uploads',
  'post',
  201
>;

/**
 * Uploads a larger file in parts.
 * Create the upload, upload the parts and complete it, or delete it to abort.
 */
export class FileUploadsResource {
  public readonly parts: FileUploadPartsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.parts = new FileUploadPartsResource(httpClient);
  }

  /**
   * Assembles the parts into the file and checks its hash.
   * If the app already holds the hash, the stored file is answered without assembly, so the client retries the call.
   */
  public async complete(options: CompleteFileUploadOptions): Promise<AppFile> {
    const { appId, sha256, uploadId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/complete',
        { appId, sha256, uploadId },
      ),
    });
  }

  /**
   * Starts a multipart file upload.
   * Every part but the last must have the same size of at least five mebibytes.
   * The start holds no state, and an unused upload expires on its own, so the client retries the call.
   */
  public async create(options: CreateFileUploadOptions): Promise<FileUpload> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/files/{sha256}/uploads', options),
    });
  }

  /**
   * Aborts a multipart file upload and discards its parts.
   */
  public async delete(options: DeleteFileUploadOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}',
        options,
      ),
    });
  }
}
