import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import { DeviceEventsResource } from './device-events';

export type CountDevicesOptions = PathParameters<
  '/v1/apps/{appId}/devices/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/count', 'get'>;

export type DeleteDeviceOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}',
  'delete'
>;

export type DeleteManyDevicesOptions = PathParameters<
  '/v1/apps/{appId}/devices',
  'delete'
> &
  QueryParameters<'/v1/apps/{appId}/devices', 'delete'>;

/**
 * A device in the registry, with the facts of its last report.
 */
export type Device = JsonResponseBody<
  '/v1/apps/{appId}/devices',
  'get',
  200
>[number];

export type GetDeviceOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/{deviceId}', 'get'>;

export type ListDevicesOptions = PathParameters<
  '/v1/apps/{appId}/devices',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices', 'get'>;

export class DevicesResource {
  public readonly events: DeviceEventsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.events = new DeviceEventsResource(httpClient);
  }

  /**
   * Counts the devices of the app that match the filters.
   */
  public async count(options: CountDevicesOptions): Promise<Count> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/count', { appId }),
      query,
    });
  }

  /**
   * Deletes a device from the registry, for an erasure request.
   */
  public async delete(options: DeleteDeviceOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}', options),
    });
  }

  /**
   * Deletes the devices of the app named by `ids`, one to 100. An id of another app is skipped.
   */
  public async deleteMany(options: DeleteManyDevicesOptions): Promise<void> {
    const { appId, ...query } = options;
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/devices', { appId }),
      query,
    });
  }

  public async get(options: GetDeviceOptions): Promise<Device> {
    const { appId, deviceId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}', {
        appId,
        deviceId,
      }),
      query,
    });
  }

  /**
   * Lists the devices of the app, newest report first.
   * `attribute` takes one `key=value` pair.
   */
  public async list(options: ListDevicesOptions): Promise<Device[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices', { appId }),
      query,
    });
  }
}
