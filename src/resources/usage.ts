import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * One live app's usage in a month: its monthly active devices and its data transfer, with the app as `relations: ['app']` embeds it.
 */
export type AppUsageMonth = JsonResponseBody<
  '/v1/organizations/{organizationId}/usage/apps',
  'get',
  200
>[number];

export type CountUsageAppsOptions = PathParameters<
  '/v1/organizations/{organizationId}/usage/apps/count',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/usage/apps/count', 'get'>;

/**
 * The month the CSV holds every app's row of.
 */
export type DownloadUsageAppsCsvOptions = CountUsageAppsOptions;

export type GetUsageOptions = PathParameters<
  '/v1/organizations/{organizationId}/usage',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/usage', 'get'>;

export type ListUsageAppsOptions = PathParameters<
  '/v1/organizations/{organizationId}/usage/apps',
  'get'
> &
  Omit<
    QueryParameters<'/v1/organizations/{organizationId}/usage/apps', 'get'>,
    'format'
  >;

/**
 * The organization's monthly active devices and data transfer in `month`, `YYYY-MM`, summed over its apps' rows.
 */
export type Usage = JsonResponseBody<
  '/v1/organizations/{organizationId}/usage',
  'get',
  200
>;

export class UsageResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of apps with usage in `month`, which `listApps` pages through.
   */
  public async countApps(options: CountUsageAppsOptions): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/usage/apps/count', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Every app's usage in `month` as `text/csv` with the app's name, read whole.
   */
  public async downloadAppsCsv(
    options: DownloadUsageAppsCsvOptions,
  ): Promise<Blob> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/usage/apps', {
        organizationId,
      }),
      query: { ...query, format: 'csv' },
    });
  }

  /**
   * The organization's usage in `month`, the current one by default, read from the stored months.
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

  /**
   * The usage of each live app in `month`, the most monthly active devices first; `relations: ['app']` embeds the app's id and name.
   */
  public async listApps(
    options: ListUsageAppsOptions,
  ): Promise<AppUsageMonth[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/usage/apps', {
        organizationId,
      }),
      query,
    });
  }
}
