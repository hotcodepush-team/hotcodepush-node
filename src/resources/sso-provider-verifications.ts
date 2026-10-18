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
   * Looks up the domain's TXT record for the provider's `domainVerificationToken` and sets `domainVerified` when the record carries it;
   * the answer is the provider, verified or still waiting for the record, and a resolver that cannot be asked answers `E_DNS_LOOKUP_FAILED`.
   * A verified provider answers unchanged without a lookup, so the call is retried.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
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
