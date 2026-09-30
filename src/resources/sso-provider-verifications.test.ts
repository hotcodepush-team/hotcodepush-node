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
    const verification = {
      details: { reason: 'lookup_failed' },
      domain: 'example.com',
      isVerified: false,
    };
    const fetchMock = stubFetch(() => Response.json(verification));

    const createdVerification =
      await new HotCodePush().organizations.ssoProvider.verifications.create({
        organizationId: 'organization',
      });

    expect(createdVerification).toEqual(verification);
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
