import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters, UploadBody } from '../types';
import { BundleDeltaUploadsResource } from './bundle-delta-uploads';

export type UploadBundleDeltaOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}',
  'put'
> &
  UploadBody;

export type UploadedBundleDelta = JsonResponseBody<
  '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}',
  'put',
  200
>;

export class BundleDeltasResource {
  public readonly uploads: BundleDeltaUploadsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.uploads = new BundleDeltaUploadsResource(httpClient);
  }

  /**
   * Uploads the delta pack from a base bundle of the app, a tar, before the bundle is completed.
   */
  public async upload(
    options: UploadBundleDeltaOptions,
  ): Promise<UploadedBundleDelta> {
    const { appId, baseBundleId, bundleId, ...uploadBody } = options;
    return this.httpClient.fetchUpload({
      ...uploadBody,
      contentType: 'application/x-tar',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/deltas/{baseBundleId}',
        { appId, baseBundleId, bundleId },
      ),
    });
  }
}
