import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const NOTIFICATION_PREFERENCES_URL =
  'https://api.hotcodepush.com/v1/notification-preferences';
const NOTIFICATION_PREFERENCE = {
  category: 'product_alerts',
  isEnabled: false,
  medium: 'email',
  organizationId: 'organization',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NotificationPreferencesResource', () => {
  test("should list the caller's preferences of the organization", async () => {
    const fetchMock = stubFetch(() => Response.json([NOTIFICATION_PREFERENCE]));

    const fetchedNotificationPreferences =
      await new HotCodePush().notificationPreferences.list({
        organizationId: 'organization',
      });

    expect(fetchedNotificationPreferences).toEqual([NOTIFICATION_PREFERENCE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${NOTIFICATION_PREFERENCES_URL}?organizationId=organization`,
    });
  });

  test('should patch one category and medium', async () => {
    const fetchMock = stubFetch(() => Response.json(NOTIFICATION_PREFERENCE));

    const updatedNotificationPreference =
      await new HotCodePush().notificationPreferences.update({
        category: 'product_alerts',
        isEnabled: false,
        medium: 'email',
        organizationId: 'organization',
      });

    expect(updatedNotificationPreference).toEqual(NOTIFICATION_PREFERENCE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        category: 'product_alerts',
        isEnabled: false,
        medium: 'email',
        organizationId: 'organization',
      },
      method: 'PATCH',
      url: NOTIFICATION_PREFERENCES_URL,
    });
  });
});
