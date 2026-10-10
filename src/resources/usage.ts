import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * The month `get` takes; the CSV holds the apps' rows.
 */
export type DownloadUsageCsvOptions = GetUsageOptions;

export type GetUsageOptions = PathParameters<
  '/v1/organizations/{organizationId}/usage',
  'get'
> &
  Omit<
    QueryParameters<'/v1/organizations/{organizationId}/usage', 'get'>,
    'format'
  >;

/**
 * The monthly active devices and bytes of each live app in `month`, `YYYY-MM`, beside the organization's total.
 */
export type Usage = JsonResponseBody<
  '/v1/organizations/{organizationId}/usage',
  'get',
  200
>;

export class UsageResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The apps' usage in `month` as `text/csv`, read whole.
   */
  public async downloadCsv(options: DownloadUsageCsvOptions): Promise<Blob> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/usage', {
        organizationId,
      }),
      query: { ...query, format: 'csv' },
    });
  }

  /**
   * The usage of `month`, the current one by default: a past month the invoice's number, the current month's devices counted live.
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
