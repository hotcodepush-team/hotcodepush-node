import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

/**
 * The active devices of the channel that the conditions of the release reach, and the estimate at its rollout percentage.
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
   * Gets the devices a release reaches.
   * The API evaluates the registry the same way a device evaluates the index.
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
