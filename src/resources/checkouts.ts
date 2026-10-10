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
   * Enables billing on a free organization: the Polar checkout for pay-as-you-go with the chosen spending cap,
   * the subscription arriving once it is paid.
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
