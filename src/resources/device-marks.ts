import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountDeviceMarksOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}/marks/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/{deviceId}/marks/count', 'get'>;

/**
 * A device's mark on a release: applied, attempted, checked or failed, with the reason a failure gave.
 */
export type DeviceMark = JsonResponseBody<
  '/v1/apps/{appId}/devices/{deviceId}/marks',
  'get',
  200
>[number];

export type ListDeviceMarksOptions = PathParameters<
  '/v1/apps/{appId}/devices/{deviceId}/marks',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/devices/{deviceId}/marks', 'get'>;

export class DeviceMarksResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the device's marks under the list's filter.
   */
  public async count(options: CountDeviceMarksOptions): Promise<Count> {
    const { appId, deviceId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}/marks/count', {
        appId,
        deviceId,
      }),
      query,
    });
  }

  /**
   * The device's marks across the app's releases, newest first, filtered by `releaseId`.
   */
  public async list(options: ListDeviceMarksOptions): Promise<DeviceMark[]> {
    const { appId, deviceId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/devices/{deviceId}/marks', {
        appId,
        deviceId,
      }),
      query,
    });
  }
}
