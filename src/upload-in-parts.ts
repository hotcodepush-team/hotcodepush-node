import type { UploadedPart } from './resources/file-upload-parts';
import type { BlobUploadBody, UploadBody } from './types';

/**
 * Every part but the last is this size: at least five mebibytes and all of one size, the bucket's rule.
 */
export const PART_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * A `Blob` goes up in one request up to this size and in parts above it, well under the request-body cap of the API's plan.
 */
export const SINGLE_UPLOAD_LIMIT_BYTES = 64 * 1024 * 1024;

/**
 * The multipart upload the files, the pack and the delta pack share, each addressed by its own path parameters.
 */
export interface MultipartUploadsResource<TPathParameters, TCompleted> {
  complete(
    options: TPathParameters & { parts: UploadedPart[]; uploadId: string },
  ): Promise<TCompleted>;
  create(options: TPathParameters): Promise<{ uploadId: string }>;
  delete(options: TPathParameters & { uploadId: string }): Promise<void>;
  parts: {
    upload(
      options: TPathParameters & {
        body: Blob;
        partNumber: number;
        uploadId: string;
      },
    ): Promise<UploadedPart>;
  };
}

/**
 * A stream is read once and cannot be split, so only a `Blob` goes up in parts.
 */
export function isBlobAboveSingleUploadLimit(
  uploadBody: UploadBody,
): uploadBody is BlobUploadBody {
  return (
    uploadBody.body instanceof Blob &&
    uploadBody.body.size > SINGLE_UPLOAD_LIMIT_BYTES
  );
}

/**
 * Uploads a `Blob` in parts of `PART_SIZE_BYTES`, numbered from 1, then completes the upload;
 * a failed part or completion deletes the upload and rethrows.
 */
export async function uploadInParts<TPathParameters extends object, TCompleted>(
  uploads: MultipartUploadsResource<TPathParameters, TCompleted>,
  pathParameters: TPathParameters,
  blob: Blob,
): Promise<TCompleted> {
  const { uploadId } = await uploads.create(pathParameters);
  try {
    const parts: UploadedPart[] = [];
    for (
      let start = 0, partNumber = 1;
      start < blob.size;
      start += PART_SIZE_BYTES, partNumber += 1
    ) {
      const uploadedPart = await uploads.parts.upload({
        ...pathParameters,
        body: blob.slice(start, start + PART_SIZE_BYTES),
        partNumber,
        uploadId,
      });
      parts.push(uploadedPart);
    }
    return await uploads.complete({ ...pathParameters, parts, uploadId });
  } catch (error) {
    await uploads
      .delete({ ...pathParameters, uploadId })
      .catch(() => undefined);
    throw error;
  }
}
