import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonRequestBody, PathParameters } from '../types';

export type UploadBundleExpoManifestOptions = PathParameters<
  '/v1/apps/{appId}/bundles/{bundleId}/expo/{platform}/manifest',
  'put'
> &
  JsonRequestBody<
    '/v1/apps/{appId}/bundles/{bundleId}/expo/{platform}/manifest',
    'put'
  >;

export class BundleExpoManifestResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Stores the bundle's Expo-format manifest for one platform, with its signature, before the bundle is completed.
   * A second upload replaces the first, so the call is retried.
   */
  public async upload(options: UploadBundleExpoManifestOptions): Promise<void> {
    const { appId, bundleId, platform, ...body } = options;
    await this.httpClient.fetchJson({
      body,
      method: 'PUT',
      path: resolvePath(
        '/v1/apps/{appId}/bundles/{bundleId}/expo/{platform}/manifest',
        { appId, bundleId, platform },
      ),
    });
  }
}
