import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SsoProviderVerificationsResource', () => {
  test('should post to verify the domain', async () => {
    const ssoProvider = { domain: 'example.com', domainVerified: true };
    const fetchMock = stubFetch(() => Response.json(ssoProvider));

    const verifiedSsoProvider =
      await new HotCodePush().organizations.ssoProvider.verifications.create({
        organizationId: 'organization',
      });

    expect(verifiedSsoProvider).toEqual(ssoProvider);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/organizations/organization/sso-provider/verifications',
    });
  });

  test('should retry the verification when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.ssoProvider.verifications.create({
        organizationId: 'organization',
      }),
    );

    expect(attemptCount).toBe(3);
  });
});
