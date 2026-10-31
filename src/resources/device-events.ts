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
 * The first event of each type that a device sent for a release: applied, checked, confirmed or failed.
 * A failed event carries its reason.
 */
export type ReleaseDeviceEvent = JsonResponseBody<
  '/v1/apps/{appId}/devices/{deviceId}/events',
  'get',
  200
>[number];

export class DeviceEventsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the events of the device that match the filter.
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
   * Lists the events of the device across all releases of the app, newest first, filtered by `releaseId`.
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
