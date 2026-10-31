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
   * Creates a Polar checkout that enables pay-as-you-go billing on a free organization.
   * The email of the caller is pre-filled and can be changed on the Polar page.
   * Once paid, the subscription names the organization and starts at the $5 minimum spending cap, which the customer can raise later.
   * Each call creates another checkout and the API keeps no `Idempotency-Key` for it, so the client never retries the call.
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
