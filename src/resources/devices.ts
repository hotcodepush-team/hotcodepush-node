import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountDevicesOptions = PathParameters<
  '/v1/apps/{appId}/devices/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/count', 'get'>;

export type DeleteDeviceOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}',
  'delete'
>;

/**
 * A device of the registry, the facts of its last report.
 */
export type Device = JsonResponseBody<
  '/v1/apps/{appId}/devices',
  'get',
  200
>[number];

/**
 * A device with its per-release marks, newest first.
 */
export type DeviceWithMarks = JsonResponseBody<
  '/v1/apps/{appId}/devices/{deviceId}',
  'get',
  200
>;

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
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the app's devices under the list's filters.
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
   * Deletes a device's registry row and marks, the erasure request.
   */
  public async delete(options: DeleteDeviceOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}', options),
    });
  }

  public async get(options: GetDeviceOptions): Promise<DeviceWithMarks> {
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
   * The app's devices, the newest report first; `attribute` takes one `key=value`.
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
