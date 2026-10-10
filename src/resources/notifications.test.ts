import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const NOTIFICATIONS_URL = 'https://api.hotcodepush.com/v1/notifications';
const NOTIFICATION = {
  id: 'notification',
  isRead: false,
  type: 'release-paused',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NotificationsResource', () => {
  test("should count the caller's unread notifications", async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().notifications.count({
      isRead: 'false',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${NOTIFICATIONS_URL}/count?isRead=false`,
    });
  });

  test("should list the caller's unread notifications", async () => {
    const fetchMock = stubFetch(() => Response.json([NOTIFICATION]));

    const fetchedNotifications = await new HotCodePush().notifications.list({
      isRead: 'false',
      limit: 10,
    });

    expect(fetchedNotifications).toEqual([NOTIFICATION]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${NOTIFICATIONS_URL}?isRead=false&limit=10`,
    });
  });

  test('should patch the notification read', async () => {
    const fetchMock = stubFetch(() =>
      Response.json({ ...NOTIFICATION, isRead: true }),
    );

    const updatedNotification = await new HotCodePush().notifications.update({
      isRead: true,
      notificationId: 'notification',
    });

    expect(updatedNotification).toEqual({ ...NOTIFICATION, isRead: true });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isRead: true },
      method: 'PATCH',
      url: `${NOTIFICATIONS_URL}/notification`,
    });
  });

  test("should patch every one of the caller's notifications read", async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().notifications.updateMany({ isRead: true });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isRead: true },
      method: 'PATCH',
      url: NOTIFICATIONS_URL,
    });
  });
});
