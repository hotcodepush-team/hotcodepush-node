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
   * A session of Polar's customer portal for the organization's invoices and payment method; an organization that never subscribed has none.
   * Each call creates another session and the API keeps no `Idempotency-Key` for it, so the call is never retried.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
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
