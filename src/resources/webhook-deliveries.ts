import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountWebhookDeliveriesOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries/count',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries/count',
    'get'
  >;

export type ListWebhookDeliveriesOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries',
    'get'
  >;

export type RedeliverWebhookDeliveryOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries/{deliveryId}/redeliver',
  'post'
>;

/**
 * One event sent to a webhook with its attempts: the `type`, the audit type or `webhook.test`, the `status`, `pending`, `succeeded` or `failed`,
 * the receiver's last `responseCode` and `responseBody`, cut at 4,096 characters, and `nextAttemptAt` while the queue retries it.
 */
export type WebhookDelivery = JsonResponseBody<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries',
  'get',
  200
>[number];

/**
 * A webhook's delivery log, each delivery kept for 30 days.
 */
export class WebhookDeliveriesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the webhook's deliveries under the list's filters.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(options: CountWebhookDeliveriesOptions): Promise<Count> {
    const { organizationId, webhookId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries/count',
        { organizationId, webhookId },
      ),
      query,
    });
  }

  /**
   * The webhook's deliveries, newest first, filtered by `status` and by `createdSince` and `createdUntil`, both inclusive.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(
    options: ListWebhookDeliveriesOptions,
  ): Promise<WebhookDelivery[]> {
    const { organizationId, webhookId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries',
        { organizationId, webhookId },
      ),
      query,
    });
  }

  /**
   * Delivers the event again, once, within the request, and answers the settled delivery, its attempt count carried on.
   * Each call makes another attempt, so the call is never retried.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async redeliver(
    options: RedeliverWebhookDeliveryOptions,
  ): Promise<WebhookDelivery> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries/{deliveryId}/redeliver',
        options,
      ),
    });
  }
}
