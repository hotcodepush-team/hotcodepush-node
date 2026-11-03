import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountTelemetryExportDeliveriesOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export/deliveries/count',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/telemetry-export/deliveries/count',
    'get'
  >;

export type ListTelemetryExportDeliveriesOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export/deliveries',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/telemetry-export/deliveries',
    'get'
  >;

export type RedeliverTelemetryExportDeliveryOptions = PathParameters<
  '/v1/organizations/{organizationId}/telemetry-export/deliveries/{deliveryId}/redeliver',
  'post'
>;

/**
 * One record or document sent to the telemetry export, with its attempts.
 * `status` is `pending`, `succeeded` or `failed`. `responseCode` and `responseBody` come from the last attempt, the body cut at 4,096 characters.
 * `nextAttemptAt` is set while the queue retries.
 */
export type TelemetryExportDelivery = JsonResponseBody<
  '/v1/organizations/{organizationId}/telemetry-export/deliveries',
  'get',
  200
>[number];

/**
 * The delivery log of the telemetry export. Each delivery is kept for 30 days.
 */
export class TelemetryExportDeliveriesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the deliveries of the telemetry export that match the filters.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(
    options: CountTelemetryExportDeliveriesOptions,
  ): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export/deliveries/count',
        { organizationId },
      ),
      query,
    });
  }

  /**
   * Lists the deliveries of the telemetry export, newest first.
   * Filter by `status`, and by `createdSince` and `createdUntil`, both inclusive.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(
    options: ListTelemetryExportDeliveriesOptions,
  ): Promise<TelemetryExportDelivery[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export/deliveries',
        { organizationId },
      ),
      query,
    });
  }

  /**
   * Sends the record again, once, within the request, and answers the settled delivery with its attempt count carried on.
   * Each call makes another attempt, so the client never retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async redeliver(
    options: RedeliverTelemetryExportDeliveryOptions,
  ): Promise<TelemetryExportDelivery> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/telemetry-export/deliveries/{deliveryId}/redeliver',
        options,
      ),
    });
  }
}
