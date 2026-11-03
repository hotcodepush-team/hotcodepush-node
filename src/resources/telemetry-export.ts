import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import type { TelemetryExportDelivery } from './telemetry-export-deliveries';
import { TelemetryExportDeliveriesResource } from './telemetry-export-deliveries';

export type DeleteTelemetryExportOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export',
  'delete'
>;

export type GetTelemetryExportOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export',
  'get'
>;

export type SetTelemetryExportOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export',
  'put'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/telemetry-export', 'put'>;

/**
 * The one telemetry export of the organization: the OTLP base URL, its `signals` (`logs`, `metrics` or both) and its `headerNames`.
 * The header values are write-only. `disabledAt` is set while the export is off, by hand or after fifty failed deliveries in a row.
 */
export type TelemetryExport = JsonResponseBody<
  '/v1/organizations/{organizationId}/telemetry-export',
  'get',
  200
>;

export type TestTelemetryExportOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export/test',
  'post'
>;

export type UpdateTelemetryExportOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export',
  'patch'
> &
  JsonRequestBody<
    '/v1/organizations/{organizationId}/telemetry-export',
    'patch'
  >;

/**
 * The telemetry export of the organization, for Admins and Owners.
 * Setting, switching, testing and redelivering need a paying plan, and any other plan answers `plan_required`; reading and deleting do not.
 */
export class TelemetryExportResource {
  public readonly deliveries: TelemetryExportDeliveriesResource;

  constructor(private readonly httpClient: HttpClient) {
    this.deliveries = new TelemetryExportDeliveriesResource(httpClient);
  }

  /**
   * Removes the telemetry export with its delivery log, on any plan.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteTelemetryExportOptions): Promise<void> {
    await this.httpClient.fetchStatus({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export',
        options,
      ),
    });
  }

  /**
   * Gets the telemetry export of the organization; an organization without one answers `not_found`.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async get(
    options: GetTelemetryExportOptions,
  ): Promise<TelemetryExport> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export',
        options,
      ),
    });
  }

  /**
   * Sets the OTLP/HTTP base URL, the `headers` that carry the vendor's credentials and the `signals`, replacing the export before.
   * A URL ending in a signal path answers `url_signal_path`, and a `content-type`, `content-length` or `host` header `header_reserved`.
   * The export starts enabled.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async set(
    options: SetTelemetryExportOptions,
  ): Promise<TelemetryExport> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PUT',
      path: resolvePath('/v1/organizations/{organizationId}/telemetry-export', {
        organizationId,
      }),
    });
  }

  /**
   * Sends one delivery per signal within the request, a `telemetry_export.test` log record and the current metrics document, and answers the settled deliveries.
   * Each call sends again, so the client never retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async test(
    options: TestTelemetryExportOptions,
  ): Promise<TelemetryExportDelivery[]> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export/test',
        options,
      ),
    });
  }

  /**
   * Switches the telemetry export on or off. `isEnabled: false` stamps `disabledAt`; `isEnabled: true` clears it and resets the count of failed deliveries in a row.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async update(
    options: UpdateTelemetryExportOptions,
  ): Promise<TelemetryExport> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/organizations/{organizationId}/telemetry-export', {
        organizationId,
      }),
    });
  }
}
