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
 * One event sent to a webhook, with its attempts.
 * `type` is the audit type or `webhook.test`, and `status` is `pending`, `succeeded` or `failed`.
 * `responseCode` and `responseBody` come from the last attempt, the body cut at 4,096 characters. `nextAttemptAt` is set while the queue retries.
 */
export type WebhookDelivery = JsonResponseBody<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/deliveries',
  'get',
  200
>[number];

/**
 * The delivery log of a webhook. Each delivery is kept for 30 days.
 */
export class WebhookDeliveriesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the deliveries of the webhook that match the filters.
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
   * Lists the deliveries of the webhook, newest first.
   * Filter by `status`, and by `createdSince` and `createdUntil`, both inclusive.
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
   * Delivers the event again, once, within the request, and answers the settled delivery with its attempt count carried on.
   * Each call makes another attempt, so the client never retries the call.
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
