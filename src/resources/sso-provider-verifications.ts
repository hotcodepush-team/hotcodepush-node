import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters } from '../types';
import type { SsoProvider } from './sso-provider';

export type CreateSsoProviderVerificationOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider/verifications',
  'post'
>;

export class SsoProviderVerificationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Verifies the SSO domain: looks for `domainVerificationToken` in the TXT record of the domain and sets `domainVerified` when found.
   * Answers the provider, verified or still waiting for the record. A DNS resolver that cannot be reached answers `dns_lookup_failed`.
   * A verified provider answers unchanged without a lookup, so the client retries the call.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async create(
    options: CreateSsoProviderVerificationOptions,
  ): Promise<SsoProvider> {
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
