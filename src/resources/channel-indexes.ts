import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

/**
 * The document describes the index as an object without properties.
 */
export type ChannelIndex = JsonResponseBody<
  '/v1/apps/{appId}/channels/{channelId}/indexes/{platform}',
  'get',
  200
>;

export type GetChannelIndexOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/indexes/{platform}',
  'get'
>;

export class ChannelIndexesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The channel's index for a platform as the database sees it, to compare with the copy the CDN serves.
   */
  public async get(options: GetChannelIndexOptions): Promise<ChannelIndex> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/channels/{channelId}/indexes/{platform}',
        options,
      ),
    });
  }
}
