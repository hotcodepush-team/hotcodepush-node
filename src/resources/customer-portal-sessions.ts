import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

export type CreateCustomerPortalSessionOptions = PathParameters<
  '/v1/organizations/{organizationId}/customer-portal-sessions',
  'post'
>;

/**
 * The URL of the Polar customer portal to open.
 */
export type CustomerPortalSession = JsonResponseBody<
  '/v1/organizations/{organizationId}/customer-portal-sessions',
  'post',
  201
>;

export class CustomerPortalSessionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Creates a Polar customer portal session for the invoices and payment method of the organization.
   * An organization that never subscribed has no portal.
   * Each call creates another session and the API keeps no `Idempotency-Key` for it, so the client never retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async create(
    options: CreateCustomerPortalSessionOptions,
  ): Promise<CustomerPortalSession> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/customer-portal-sessions',
        options,
      ),
    });
  }
}
