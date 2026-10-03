import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The channel's active devices, the ones every condition reaches and the estimate at the rollout percentage.
 */
export type Audience = JsonResponseBody<
  '/v1/apps/{appId}/channels/{channelId}/audience',
  'get',
  200
>;

export type GetAudienceOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/audience',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels/{channelId}/audience', 'get'>;

export class ChannelAudienceResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The devices a release's conditions would reach in the channel before it exists;
   * each condition repeats, and repeated conditions combine with AND.
   */
  public async get(options: GetAudienceOptions): Promise<Audience> {
    const { appId, channelId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/audience', {
        appId,
        channelId,
      }),
      query,
    });
  }
}
