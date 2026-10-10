import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';

/**
 * The organization's billing this month: the plan, the spending cap and a lowered one waiting for the next month,
 * the MAU counted so far against the ceiling the plan sets, and `cappedAt` once the cap was reached.
 */
export type Billing = JsonResponseBody<
  '/v1/organizations/{organizationId}/billing',
  'get',
  200
>;

export type GetBillingOptions = PathParameters<
  '/v1/organizations/{organizationId}/billing',
  'get'
>;

export type UpdateBillingOptions = PathParameters<
  '/v1/organizations/{organizationId}/billing',
  'patch'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/billing', 'patch'>;

export class BillingResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async get(options: GetBillingOptions): Promise<Billing> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/billing', options),
    });
  }

  /**
   * Sets the spending cap in whole dollars: a raise applies now, a lower cap from the next billing month.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async update(options: UpdateBillingOptions): Promise<Billing> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/organizations/{organizationId}/billing', {
        organizationId,
      }),
    });
  }
}
