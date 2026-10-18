import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountDeviceEventsOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}/events/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/{deviceId}/events/count', 'get'>;

export type ListDeviceEventsOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}/events',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/{deviceId}/events', 'get'>;

/**
 * A device's first event of each type on a release: applied, attempted, checked or failed, with the reason a failure gave.
 */
export type ReleaseDeviceEvent = JsonResponseBody<
  '/v1/apps/{appId}/devices/{deviceId}/events',
  'get',
  200
>[number];

export class DeviceEventsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the device's events under the list's filter.
   */
  public async count(options: CountDeviceEventsOptions): Promise<Count> {
    const { appId, deviceId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}/events/count', {
        appId,
        deviceId,
      }),
      query,
    });
  }

  /**
   * The device's events across the app's releases, newest first, filtered by `releaseId`.
   */
  public async list(
    options: ListDeviceEventsOptions,
  ): Promise<ReleaseDeviceEvent[]> {
    const { appId, deviceId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}/events', {
        appId,
        deviceId,
      }),
      query,
    });
  }
}
