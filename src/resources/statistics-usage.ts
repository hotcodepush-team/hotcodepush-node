import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type GetUsageStatisticsOptions = PathParameters<
  '/v1/apps/{appId}/statistics/usage',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/statistics/usage', 'get'>;

/**
 * The monthly active devices per month the period touches and the checks and bytes per day.
 */
export type UsageStatistics = JsonResponseBody<
  '/v1/apps/{appId}/statistics/usage',
  'get',
  200
>;

export class StatisticsUsageResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The usage statistics of the period, `periodSince` to `periodUntil` inclusive.
   */
  public async get(
    options: GetUsageStatisticsOptions,
  ): Promise<UsageStatistics> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/statistics/usage', { appId }),
      query,
    });
  }
}
