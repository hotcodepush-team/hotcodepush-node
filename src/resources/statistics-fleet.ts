import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The devices seen in the last thirty days counted per dimension, each the most common first.
 */
export type FleetStatistics = JsonResponseBody<
  '/v1/apps/{appId}/statistics/fleet',
  'get',
  200
>;

export type GetFleetStatisticsOptions = PathParameters<
  '/v1/apps/{appId}/statistics/fleet',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/statistics/fleet', 'get'>;

export class StatisticsFleetResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The registry's snapshot of the fleet, of one channel when `channelId` names it.
   */
  public async get(
    options: GetFleetStatisticsOptions,
  ): Promise<FleetStatistics> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/statistics/fleet', { appId }),
      query,
    });
  }
}
