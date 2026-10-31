import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

/**
 * One audit log entry: who did what to which object, and when.
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
 * The same filters as `list`. The CSV holds every matching entry, without pages.
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
   * Counts the audit log entries that match the filters.
   * An API token answers `forbidden`; sign in with a session.
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
   * Downloads the audit log entries that match the filters as a `text/csv` `Blob`.
   * An API token answers `forbidden`; sign in with a session.
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
   * Lists the audit log of the organization, newest first.
   * `type` takes a wildcard such as `channel.*` to match every action on one kind of object.
   * Needs a plan that includes the audit log; any other plan answers `plan_required`.
   * An API token answers `forbidden`; sign in with a session.
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
