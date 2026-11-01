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

export type SetSsoProviderOptions = PathParameters<
  '/v1/organizations/{organizationId}/sso-provider',
  'put'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/sso-provider', 'put'>;

/**
 * The one SSO provider of the organization: its domain, its `type` (`oidc` or `saml`) and its `domainVerificationToken`.
 * The TXT record `_hotcodepush-sso-{providerId}.{domain}` must carry the token until `domainVerified` is true. The configs are write-only.
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
   * Removes the SSO provider. Its members can sign in with a password again, and the domain is forgotten.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteSsoProviderOptions): Promise<void> {
    await this.httpClient.fetchStatus({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/sso-provider',
        options,
      ),
    });
  }

  /**
   * Gets the SSO provider of the organization.
   * An API token answers `forbidden`; sign in with a session.
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
   * Sets the OIDC or SAML provider and its domain, replacing the one before.
   * A new or changed domain starts unverified, with a new token for its TXT record.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async set(options: SetSsoProviderOptions): Promise<SsoProvider> {
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
