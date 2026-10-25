import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { WebhookDelivery } from './webhook-deliveries';
import { WebhookDeliveriesResource } from './webhook-deliveries';

export type CountWebhooksOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/count',
  'get'
>;

/**
 * The created webhook with its signing `secret`, answered this once; null for a chat format, whose URL carries the token.
 */
export type CreatedWebhook = JsonResponseBody<
  '/v1/organizations/{organizationId}/webhooks',
  'post',
  201
>;

export type CreateWebhookOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks',
  'post'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/webhooks', 'post'>;

export type DeleteWebhookOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}',
  'delete'
>;

export type GetWebhookOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}',
  'get'
>;

export type ListWebhooksOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/webhooks', 'get'>;

export type TestWebhookOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}/test',
  'post'
>;

export type UpdateWebhookOptions = PathParameters<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}',
  'patch'
> &
  JsonRequestBody<
    '/v1/organizations/{organizationId}/webhooks/{webhookId}',
    'patch'
  >;

/**
 * An outbound webhook, its row: the `format`, `raw` for the JSON payload or `slack`, `discord` or `teams` for a chat message,
 * the subscribed audit `events`, the app filter, null for every app's events and the organization's, and `isEnabled`,
 * off after fifty consecutive failed deliveries.
 */
export type Webhook = JsonResponseBody<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}',
  'get',
  200
>;

/**
 * The organization's webhooks, for Admins and Owners on a paying plan; any other plan answers `plan_required`.
 */
export class WebhooksResource {
  public readonly deliveries: WebhookDeliveriesResource;

  constructor(private readonly httpClient: HttpClient) {
    this.deliveries = new WebhookDeliveriesResource(httpClient);
  }

  /**
   * The number of the organization's webhooks.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(options: CountWebhooksOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/count',
        options,
      ),
    });
  }

  /**
   * Creates a webhook, its name unique in the organization, `webhook_name_taken` otherwise; a `raw` webhook answers its secret this once.
   * The API keeps no `Idempotency-Key` for it and a repeat answers `webhook_name_taken`, so the call is never retried.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async create(options: CreateWebhookOptions): Promise<CreatedWebhook> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/organizations/{organizationId}/webhooks', {
        organizationId,
      }),
    });
  }

  /**
   * Deletes the webhook with its delivery log.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteWebhookOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}',
        options,
      ),
    });
  }

  /**
   * An API token answers `forbidden`; sign in with a session.
   */
  public async get(options: GetWebhookOptions): Promise<Webhook> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}',
        options,
      ),
    });
  }

  /**
   * The organization's webhooks, newest first.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(options: ListWebhooksOptions): Promise<Webhook[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/webhooks', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Sends one sample event, `webhook.test`, through the webhook's delivery path within the request and answers the settled delivery.
   * Each call sends another sample event, so the call is never retried.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async test(options: TestWebhookOptions): Promise<WebhookDelivery> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}/test',
        options,
      ),
    });
  }

  /**
   * Changes the name, the URL, the subscribed `events`, the app filter or `isEnabled`; the format and the secret never change.
   * Setting `isEnabled` on a webhook disabled after fifty consecutive failed deliveries starts its count again.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async update(options: UpdateWebhookOptions): Promise<Webhook> {
    const { organizationId, webhookId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath(
        '/v1/organizations/{organizationId}/webhooks/{webhookId}',
        { organizationId, webhookId },
      ),
    });
  }
}
