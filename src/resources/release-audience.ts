import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

/**
 * The channel's active devices the release's own conditions reach and the estimate at its rollout percentage.
 */
export type ReleaseAudience = JsonResponseBody<
  '/v1/apps/{appId}/releases/{releaseId}/audience',
  'get',
  200
>;

export type GetReleaseAudienceOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}/audience',
  'get'
>;

export class ReleaseAudienceResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The devices a release reaches, evaluated over the registry the way the device evaluates the index.
   */
  public async get(
    options: GetReleaseAudienceOptions,
  ): Promise<ReleaseAudience> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/releases/{releaseId}/audience',
        options,
      ),
    });
  }
}
