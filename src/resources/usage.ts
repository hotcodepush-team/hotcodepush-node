import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The usage of one live app in a month: its monthly active devices and data transfer.
 * `relations: ['app']` embeds the app.
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
 * The month to export. The CSV holds one row per app.
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
 * The monthly active devices and data transfer of the organization in `month` (`YYYY-MM`), summed over its apps.
 */
export type Usage = JsonResponseBody<
  '/v1/organizations/{organizationId}/usage',
  'get',
  200
>;

export class UsageResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the apps with usage in `month`, for paging through `listApps`.
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
   * Downloads the usage of every app in `month`, with the app name, as a `text/csv` `Blob`.
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

  /**
   * Lists the usage of each live app in `month`, most monthly active devices first.
   * `relations: ['app']` embeds the id and name of the app.
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
