import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type GetUpdateStatisticsOptions = PathParameters<
  '/v1/apps/{appId}/statistics/updates',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/statistics/updates', 'get'>;

/**
 * The updates per day in the period, next to the active devices of the channel that the adoption rate divides by.
 * Also the adoption curves of the newest live releases and the reasons the devices reported.
 */
export type UpdateStatistics = JsonResponseBody<
  '/v1/apps/{appId}/statistics/updates',
  'get',
  200
>;

export class StatisticsUpdatesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Gets the update statistics from `periodSince` to `periodUntil`, both inclusive, for one channel when `channelId` is set.
   * `releaseId` limits the adoption curves to that one release, whatever its age.
   */
  public async get(
    options: GetUpdateStatisticsOptions,
  ): Promise<UpdateStatistics> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/statistics/updates', { appId }),
      query,
    });
  }
}
