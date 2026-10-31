import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The devices seen in the last thirty days.
 * `deviceCount` counts them all, and `currentDeviceCount` counts those running the newest active release of their channel.
 * The counts per dimension come most common first; binaries also carry their platform, version and newest report.
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
   * Gets a snapshot of the fleet from the registry, for one channel when `channelId` is set.
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
