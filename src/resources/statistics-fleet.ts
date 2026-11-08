import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The devices seen in the last thirty days.
 * `deviceCount` counts them all. `currentDeviceCount`, `pendingDeviceCount` and `ineligibleDeviceCount` split them by the newest active release serving each device's platform in its channel.
 * A device is current when it runs that release's bundle, ineligible when its first check skipped the release for a targeting or compatibility reason, and pending otherwise.
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
   * Gets a snapshot of the fleet from the registry, for one channel when `channelId` is set and for one binary when `binaryId` is set.
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
