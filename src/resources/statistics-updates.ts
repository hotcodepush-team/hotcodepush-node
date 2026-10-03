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
 * The updates per day of the period, the adoption curves of the newest live releases and the reasons the devices reported.
 */
export type UpdateStatistics = JsonResponseBody<
  '/v1/apps/{appId}/statistics/updates',
  'get',
  200
>;

export class StatisticsUpdatesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The update statistics of the period, `periodSince` to `periodUntil` inclusive, of one channel when `channelId` names it.
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
