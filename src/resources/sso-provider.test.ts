import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const SSO_PROVIDER_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/sso-provider';
const SSO_PROVIDER = {
  domain: 'example.com',
  isVerified: false,
  provider: 'oidc',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SsoProviderResource', () => {
  test('should delete the sso provider', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.ssoProvider.delete({
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: SSO_PROVIDER_URL,
    });
  });

  test('should get the sso provider', async () => {
    const fetchMock = stubFetch(() => Response.json(SSO_PROVIDER));

    const fetchedSsoProvider =
      await new HotCodePush().organizations.ssoProvider.get({
        organizationId: 'organization',
      });

    expect(fetchedSsoProvider).toEqual(SSO_PROVIDER);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: SSO_PROVIDER_URL,
    });
  });

  test('should put the domain and the oidc provider', async () => {
    const oidc = {
      clientId: 'client',
      clientSecret: 'secret',
      issuer: 'https://idp.example.com',
    };
    const fetchMock = stubFetch(() =>
      Response.json(SSO_PROVIDER, { status: 201 }),
    );

    const putSsoProvider =
      await new HotCodePush().organizations.ssoProvider.put({
        domain: 'example.com',
        oidc,
        organizationId: 'organization',
      });

    expect(putSsoProvider).toEqual(SSO_PROVIDER);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { domain: 'example.com', oidc },
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      url: SSO_PROVIDER_URL,
    });
  });
});
