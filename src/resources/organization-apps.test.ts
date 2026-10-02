import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const APPS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/apps';
const APP = { framework: 'capacitor', id: 'app', name: 'Demo' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OrganizationAppsResource', () => {
  test('should count the apps of the organization', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().organizations.apps.count({
      organizationId: 'organization',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${APPS_URL}/count`,
    });
  });

  test('should post the app to its organization with its idempotency key', async () => {
    const fetchMock = stubFetch(() => Response.json(APP, { status: 201 }));

    const createdApp = await new HotCodePush().organizations.apps.create({
      framework: 'capacitor',
      idempotencyKey: 'key',
      name: 'Demo',
      organizationId: 'organization',
    });

    expect(createdApp).toEqual(APP);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { framework: 'capacitor', name: 'Demo' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: APPS_URL,
    });
  });

  test('should list the apps of the organization', async () => {
    const fetchMock = stubFetch(() => Response.json([APP]));

    const fetchedApps = await new HotCodePush().organizations.apps.list({
      offset: 50,
      organizationId: 'organization',
    });

    expect(fetchedApps).toEqual([APP]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${APPS_URL}?offset=50`,
    });
  });
});
