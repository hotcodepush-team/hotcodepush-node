import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

/**
 * The URL of the Polar checkout to open.
 */
export type Checkout = JsonResponseBody<
  '/v1/organizations/{organizationId}/checkouts',
  'post',
  201
>;

export type CreateCheckoutOptions = PathParameters<
  '/v1/organizations/{organizationId}/checkouts',
  'post'
>;

export class CheckoutsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Enables billing on a free organization: the Polar checkout for pay-as-you-go, the caller's email pre-filled and
   * editable on Polar's page; the subscription arrives once it is paid, names the organization, and starts at the $5
   * minimum spending cap, which the customer raises afterwards.
   * Each call creates another checkout and the API keeps no `Idempotency-Key` for it, so the call is never retried.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async create(options: CreateCheckoutOptions): Promise<Checkout> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/checkouts',
        options,
      ),
    });
  }
}
