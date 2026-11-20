import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The active devices of the channel, the devices every condition reaches and the estimate at the rollout percentage.
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
   * Estimates which devices of the channel a release with these conditions would reach, before the release exists.
   * Each condition is repeatable, and repeated conditions combine with AND.
   * `progressionRolloutPercent` is valid only beside `progressionStepMinimumUpdateCount`. Together they add the warning `progression_step_too_small` when a step adds fewer devices than the applied updates it waits for.
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
