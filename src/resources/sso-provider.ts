import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import { SsoProviderVerificationsResource } from './sso-provider-verifications';

export type DeleteSsoProviderOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider',
  'delete'
>;

export type GetSsoProviderOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider',
  'get'
>;

export type PutSsoProviderOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider',
  'put'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/sso-provider', 'put'>;

/**
 * The organization's one SSO provider, OIDC or SAML, with its domain and, until the domain is verified, the TXT record to set.
 */
export type SsoProvider = JsonResponseBody<
  '/v1/organizations/{organizationId}/sso-provider',
  'get',
  200
>;

export class SsoProviderResource {
  public readonly verifications: SsoProviderVerificationsResource;

  constructor(private readonly httpClient: HttpClient) {
    this.verifications = new SsoProviderVerificationsResource(httpClient);
  }

  /**
   * Removes the SSO provider: password sign-in works again for its members, and the domain is forgotten.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async delete(options: DeleteSsoProviderOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/sso-provider',
        options,
      ),
    });
  }

  /**
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async get(options: GetSsoProviderOptions): Promise<SsoProvider> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/sso-provider',
        options,
      ),
    });
  }

  /**
   * Sets the OIDC or SAML provider and its domain, replacing the one before; a new or changed domain starts unverified.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async put(options: PutSsoProviderOptions): Promise<SsoProvider> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PUT',
      path: resolvePath('/v1/organizations/{organizationId}/sso-provider', {
        organizationId,
      }),
    });
  }
}
