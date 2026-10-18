import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';

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
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/checkouts', 'post'>;

export class CheckoutsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Enables billing on a free organization: the organization becomes Polar's customer under `billingEmail`, the
   * caller's email by default, and the Polar checkout for pay-as-you-go opens on it; the subscription arrives once it
   * is paid and starts at the $5 minimum spending cap. An email another Polar customer holds answers `E_VALIDATION`
   * with the rule `email_in_use`.
   * Each call creates another checkout and the API keeps no `Idempotency-Key` for it, so the call is never retried.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async create(options: CreateCheckoutOptions): Promise<Checkout> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/organizations/{organizationId}/checkouts', {
        organizationId,
      }),
    });
  }
}
