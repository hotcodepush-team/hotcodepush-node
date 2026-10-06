import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * A row of the audit log: who did what to which object, and when.
 */
export type AuditLog = JsonResponseBody<
  '/v1/organizations/{organizationId}/audit-logs',
  'get',
  200
>[number];

export type CountAuditLogsOptions = PathParameters<
  '/v1/organizations/{organizationId}/audit-logs/count',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/audit-logs/count', 'get'>;

/**
 * The list's filters; the CSV holds every matching row, unpaginated.
 */
export type DownloadAuditLogsCsvOptions = CountAuditLogsOptions;

export type ListAuditLogsOptions = PathParameters<
  '/v1/organizations/{organizationId}/audit-logs',
  'get'
> &
  Omit<
    QueryParameters<'/v1/organizations/{organizationId}/audit-logs', 'get'>,
    'format'
  >;

export class AuditLogsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the audit log's rows under the list's filters.
   */
  public async count(options: CountAuditLogsOptions): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/audit-logs/count', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * The audit log under the list's filters as `text/csv`, read whole.
   */
  public async downloadCsv(
    options: DownloadAuditLogsCsvOptions,
  ): Promise<Blob> {
    const { organizationId, ...filters } = options;
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/audit-logs', {
        organizationId,
      }),
      query: { ...filters, format: 'csv' },
    });
  }

  /**
   * The organization's audit log, newest first; `type` takes `channel.*` for every action on an object.
   * Paying plans only, `E_PLAN_REQUIRED` otherwise.
   */
  public async list(options: ListAuditLogsOptions): Promise<AuditLog[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/audit-logs', {
        organizationId,
      }),
      query,
    });
  }
}
