import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const NOTIFICATION_PREFERENCES_URL =
  'https://api.hotcodepush.com/v1/notification-preferences';
const NOTIFICATION_PREFERENCE = {
  media: [{ isDefault: false, isEnabled: false, medium: 'email' }],
  type: 'release-paused',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NotificationPreferencesResource', () => {
  test("should list the organization's product alert preferences", async () => {
    const category = {
      category: 'product_alerts',
      isMandatory: false,
      types: [NOTIFICATION_PREFERENCE],
    };
    const fetchMock = stubFetch(() => Response.json([category]));

    const fetchedCategories =
      await new HotCodePush().notificationPreferences.list({
        organizationId: 'organization',
      });

    expect(fetchedCategories).toEqual([category]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${NOTIFICATION_PREFERENCES_URL}?organizationId=organization`,
    });
  });

  test('should patch one cell of the matrix', async () => {
    const fetchMock = stubFetch(() => Response.json(NOTIFICATION_PREFERENCE));

    const updatedNotificationPreference =
      await new HotCodePush().notificationPreferences.update({
        isEnabled: false,
        medium: 'email',
        organizationId: 'organization',
        type: 'release-paused',
      });

    expect(updatedNotificationPreference).toEqual(NOTIFICATION_PREFERENCE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        isEnabled: false,
        medium: 'email',
        organizationId: 'organization',
        type: 'release-paused',
      },
      method: 'PATCH',
      url: NOTIFICATION_PREFERENCES_URL,
    });
  });
});
