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
 * The created webhook with its signing `secret`, answered only this once.
 * The secret is null for a chat format, whose URL carries the token.
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
 * An outbound webhook.
 * `format` is `raw` for the JSON payload, or `slack`, `discord` or `teams` for a chat message. `events` lists the subscribed audit events.
 * The app filter is null for the events of every app and of the organization. `isEnabled` turns off after fifty failed deliveries in a row.
 */
export type Webhook = JsonResponseBody<
  '/v1/organizations/{organizationId}/webhooks/{webhookId}',
  'get',
  200
>;

/**
 * The webhooks of the organization, for Admins and Owners.
 * Needs a plan that includes webhooks; any other plan answers `plan_required`.
 */
export class WebhooksResource {
  public readonly deliveries: WebhookDeliveriesResource;

  constructor(private readonly httpClient: HttpClient) {
    this.deliveries = new WebhookDeliveriesResource(httpClient);
  }

  /**
   * Counts the webhooks of the organization.
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
   * Creates a webhook. Its name must be unique in the organization, or the call answers `webhook_name_taken`.
   * A `raw` webhook answers its secret only this once.
   * The API keeps no `Idempotency-Key` for it and a repeat answers `webhook_name_taken`, so the client never retries the call.
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
   * Deletes the webhook and its delivery log.
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
   * Gets a webhook.
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
   * Lists the webhooks of the organization, newest first.
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
   * Sends one sample event, `webhook.test`, through the normal delivery path within the request, and answers the settled delivery.
   * Each call sends another sample event, so the client never retries the call.
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
   * Changes the name, the URL, the subscribed `events`, the app filter or `isEnabled`. The format and the secret never change.
   * Enabling a webhook that was disabled after fifty failed deliveries in a row resets that count.
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
