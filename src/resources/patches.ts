import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters, UploadBody } from '../types';

/**
 * A stored delta between two contents of one file, shared by every bundle that lists the pair.
 */
export type Patch = JsonResponseBody<
  '/v1/apps/{appId}/patches/{fromSha256}/{toSha256}',
  'put',
  201
>;

export type UploadPatchOptions = PathParameters<
  '/v1/apps/{appId}/patches/{fromSha256}/{toSha256}',
  'put'
> &
  UploadBody;

export class PatchesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Uploads the patch from the content `fromSha256` to the content `toSha256`;
   * a pair the app already holds answers the existing patch.
   */
  public async upload(options: UploadPatchOptions): Promise<Patch> {
    const { appId, fromSha256, toSha256, ...uploadBody } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/octet-stream',
      path: resolvePath('/v1/apps/{appId}/patches/{fromSha256}/{toSha256}', {
        appId,
        fromSha256,
        toSha256,
      }),
    });
  }
}
