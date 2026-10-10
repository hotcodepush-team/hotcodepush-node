import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonRequestBody, PathParameters } from '../types';

export type CancelSubscriptionOptions = PathParameters<
  '/v1/organizations/{organizationId}/subscription/cancel',
  'post'
> &
  JsonRequestBody<
    '/v1/organizations/{organizationId}/subscription/cancel',
    'post'
  >;

export type UncancelSubscriptionOptions = PathParameters<
  '/v1/organizations/{organizationId}/subscription/uncancel',
  'post'
>;

/**
 * The organization's one subscription.
 */
export class SubscriptionResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Schedules the end of the subscription at the end of its period, with the reason and the comment of the retention dialog.
   * A cancel already scheduled stays as it is, so the call is retried.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async cancel(options: CancelSubscriptionOptions): Promise<void> {
    const { organizationId, ...body } = options;
    await this.httpClient.fetchJson({
      body,
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/subscription/cancel',
        { organizationId },
      ),
    });
  }

  /**
   * Clears the scheduled end of the subscription, so it renews as before.
   * A subscription with no end scheduled stays as it is, so the call is retried.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async uncancel(options: UncancelSubscriptionOptions): Promise<void> {
    await this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/subscription/uncancel',
        options,
      ),
    });
  }
}
