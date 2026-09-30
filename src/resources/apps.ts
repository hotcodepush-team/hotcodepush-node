import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import { BundlesResource } from './bundles';
import { ChannelsResource } from './channels';
import { EmbeddedBundlesResource } from './embedded-bundles';
import { FilesResource } from './files';
import { ReleasesResource } from './releases';

export type App = JsonResponseBody<'/v1/apps/{appId}', 'get', 200>;

export type DeleteAppOptions = PathParameters<'/v1/apps/{appId}', 'delete'>;

export type GetAppOptions = PathParameters<'/v1/apps/{appId}', 'get'>;

export type TransferAppOptions = PathParameters<
  '/v1/apps/{appId}/transfer',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/transfer', 'post'>;

export type UpdateAppOptions = PathParameters<'/v1/apps/{appId}', 'patch'> &
  JsonRequestBody<'/v1/apps/{appId}', 'patch'>;

export class AppsResource {
  public readonly bundles: BundlesResource;
  public readonly channels: ChannelsResource;
  public readonly embeddedBundles: EmbeddedBundlesResource;
  public readonly files: FilesResource;
  public readonly releases: ReleasesResource;

  constructor(private readonly httpClient: HttpClient) {
    this.bundles = new BundlesResource(httpClient);
    this.channels = new ChannelsResource(httpClient);
    this.embeddedBundles = new EmbeddedBundlesResource(httpClient);
    this.files = new FilesResource(httpClient);
    this.releases = new ReleasesResource(httpClient);
  }

  /**
   * Soft-deletes an app: gone at once, hard-deleted after seven days.
   */
  public async delete(options: DeleteAppOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}', options),
    });
  }

  public async get(options: GetAppOptions): Promise<App> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}', options),
    });
  }

  /**
   * Moves an app to another organization the caller is an Admin of.
   * A repeat answers `E_VALIDATION`, the app being in the target already, so the call is never retried.
   */
  public async transfer(options: TransferAppOptions): Promise<App> {
    const { appId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/transfer', { appId }),
    });
  }

  public async update(options: UpdateAppOptions): Promise<App> {
    const { appId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/apps/{appId}', { appId }),
    });
  }
}
