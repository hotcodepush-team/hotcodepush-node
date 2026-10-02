import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const BASE_URL = 'https://api.hotcodepush.com';
const ORGANIZATION = { id: 'organization', name: 'Acme' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OrganizationsResource', () => {
  test("should count the caller's organizations", async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().organizations.count();

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BASE_URL}/v1/organizations/count`,
    });
  });

  test('should post the organization with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(ORGANIZATION));

    const createdOrganization = await new HotCodePush().organizations.create({
      idempotencyKey: 'key',
      name: 'Acme',
    });

    expect(createdOrganization).toEqual(ORGANIZATION);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { name: 'Acme' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: `${BASE_URL}/v1/organizations`,
    });
  });

  test('should delete the organization', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await expect(
      new HotCodePush().organizations.delete({
        organizationId: 'organization',
      }),
    ).resolves.toBeUndefined();

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${BASE_URL}/v1/organizations/organization`,
    });
  });

  test('should get the organization', async () => {
    const fetchMock = stubFetch(() => Response.json(ORGANIZATION));

    const fetchedOrganization = await new HotCodePush().organizations.get({
      organizationId: 'organization',
    });

    expect(fetchedOrganization).toEqual(ORGANIZATION);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BASE_URL}/v1/organizations/organization`,
    });
  });

  test('should list the organizations with limit and offset', async () => {
    const fetchMock = stubFetch(() => Response.json([ORGANIZATION]));

    const fetchedOrganizations = await new HotCodePush().organizations.list({
      limit: 10,
      offset: 20,
    });

    expect(fetchedOrganizations).toEqual([ORGANIZATION]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${BASE_URL}/v1/organizations?limit=10&offset=20`,
    });
  });

  test('should patch the organization', async () => {
    const fetchMock = stubFetch(() => Response.json(ORGANIZATION));

    await new HotCodePush().organizations.update({
      isTwoFactorRequired: true,
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isTwoFactorRequired: true },
      method: 'PATCH',
      url: `${BASE_URL}/v1/organizations/organization`,
    });
  });
});
