import type { UploadedPart } from './resources/file-upload-parts';
import type { BlobUploadBody, UploadBody } from './types';

/**
 * The size of every part but the last.
 * The bucket requires at least five mebibytes, and the same size for all of them.
 */
export const PART_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * The largest `Blob` sent in one request; a larger one goes up in parts.
 * It stays well under the request body cap of the API hosting plan.
 */
export const SINGLE_UPLOAD_LIMIT_BYTES = 64 * 1024 * 1024;

// Files and packs share this upload flow, each with its own path parameters.
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

// A stream is read once and cannot be split, so only a Blob goes up in parts.
export function isBlobAboveSingleUploadLimit(
  uploadBody: UploadBody,
): uploadBody is BlobUploadBody {
  return (
    uploadBody.body instanceof Blob &&
    uploadBody.body.size > SINGLE_UPLOAD_LIMIT_BYTES
  );
}

export async function uploadInParts<TPathParameters extends object, TCompleted>(
  uploads: MultipartUploadsResource<TPathParameters, TCompleted>,
  { blob, pathParameters }: { blob: Blob; pathParameters: TPathParameters },
): Promise<TCompleted> {
  const { uploadId } = await uploads.create(pathParameters);
  try {
    const parts = await uploadEveryPart(uploads, {
      blob,
      pathParameters,
      uploadId,
    });
    return await uploads.complete({ ...pathParameters, parts, uploadId });
  } catch (error) {
    await uploads
      .delete({ ...pathParameters, uploadId })
      .catch(() => undefined);
    throw error;
  }
}

async function uploadEveryPart<TPathParameters extends object, TCompleted>(
  uploads: MultipartUploadsResource<TPathParameters, TCompleted>,
  {
    blob,
    pathParameters,
    uploadId,
  }: { blob: Blob; pathParameters: TPathParameters; uploadId: string },
): Promise<UploadedPart[]> {
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
  return parts;
}
