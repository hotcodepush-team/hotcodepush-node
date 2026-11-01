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
   * Cancels the subscription at the end of its period, with the reason and comment from the retention dialog.
   * A cancel already scheduled stays as it is, so the client retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async cancel(options: CancelSubscriptionOptions): Promise<void> {
    const { organizationId, ...body } = options;
    await this.httpClient.fetchStatus({
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
   * Undoes a scheduled cancel, so the subscription renews as before.
   * A subscription with no cancel scheduled stays as it is, so the client retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async uncancel(options: UncancelSubscriptionOptions): Promise<void> {
    await this.httpClient.fetchStatus({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/subscription/uncancel',
        options,
      ),
    });
  }
}
