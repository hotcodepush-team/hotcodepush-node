import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';

export type CreateSsoProviderVerificationOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider/verifications',
  'post'
>;

/**
 * The provider after the lookup, `isVerified` its result, and `details.reason` `lookup_failed` when the resolver could not be asked.
 */
export type SsoProviderVerification = JsonResponseBody<
  '/v1/organizations/{organizationId}/sso-provider/verifications',
  'post',
  200
>;

export class SsoProviderVerificationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Looks up the domain's TXT record for the provider's token and marks the domain verified when it is there.
   * A verified provider answers unchanged without a lookup, so the call is retried.
   */
  public async create(
    options: CreateSsoProviderVerificationOptions,
  ): Promise<SsoProviderVerification> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/organizations/{organizationId}/sso-provider/verifications',
        options,
      ),
    });
  }
}
