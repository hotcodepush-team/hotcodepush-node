import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  IdempotencyOptions,
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
> &
  IdempotencyOptions;

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
 * The multipart upload of a larger file: create, upload the parts, complete, or delete to abort.
 */
export class FileUploadsResource {
  public readonly parts: FileUploadPartsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.parts = new FileUploadPartsResource(httpClient);
  }

  /**
   * Assembles the parts into the file and checks its hash.
   */
  public async complete(options: CompleteFileUploadOptions): Promise<AppFile> {
    const { appId, sha256, uploadId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads/{uploadId}/complete',
        { appId, sha256, uploadId },
      ),
    });
  }

  /**
   * Starts a multipart upload; every part but the last is at least five mebibytes, all of one size.
   */
  public async create(options: CreateFileUploadOptions): Promise<FileUpload> {
    const { idempotencyKey, ...pathParameters } = options;
    return this.httpClient.fetchCreatingPost({
      idempotencyKey,
      path: resolvePath(
        '/v1/apps/{appId}/files/{sha256}/uploads',
        pathParameters,
      ),
    });
  }

  /**
   * Aborts a multipart upload, discarding its parts.
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
