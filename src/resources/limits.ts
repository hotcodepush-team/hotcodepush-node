import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

export type GetLimitsOptions = PathParameters<
  '/v1/organizations/{organizationId}/limits',
  'get'
>;

/**
 * Every limit in effect for the organization, keyed by name.
 * Each holds its value, the plan default and whether it is overridden.
 */
export type Limits = JsonResponseBody<
  '/v1/organizations/{organizationId}/limits',
  'get',
  200
>;

export class LimitsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Gets the limits in effect for the organization.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async get(options: GetLimitsOptions): Promise<Limits> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/limits', options),
    });
  }
}
