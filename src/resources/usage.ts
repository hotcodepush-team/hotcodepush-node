import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import { UsageAppsResource } from './usage-apps';

export type GetUsageOptions = PathParameters<
  '/v1/organizations/{organizationId}/usage',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/usage', 'get'>;

/**
 * The monthly active devices and data transfer of the organization in `month` (`YYYY-MM`), summed over its apps.
 */
export type Usage = JsonResponseBody<
  '/v1/organizations/{organizationId}/usage',
  'get',
  200
>;

export class UsageResource {
  public readonly apps: UsageAppsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.apps = new UsageAppsResource(httpClient);
  }

  /**
   * Gets the usage of the organization in `month`, the current month by default, from the stored months.
   */
  public async get(options: GetUsageOptions): Promise<Usage> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/usage', {
        organizationId,
      }),
      query,
    });
  }
}
