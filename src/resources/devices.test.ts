import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const DEVICE = { deviceId: 'device', platform: 'ios' };
const DEVICES_URL = 'https://api.hotcodepush.com/v1/apps/app/devices';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DevicesResource', () => {
  test('should count the devices under the filters', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 7 }));

    const fetchedCount = await new HotCodePush().apps.devices.count({
      appId: 'app',
      binaryVersion: '2.4.1',
      platform: 'ios',
    });

    expect(fetchedCount).toEqual({ total: 7 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DEVICES_URL}/count?binaryVersion=2.4.1&platform=ios`,
    });
  });

  test('should delete the device', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.devices.delete({
      appId: 'app',
      deviceId: 'device',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${DEVICES_URL}/device`,
    });
  });

  test('should delete the devices named by the ids', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().apps.devices.deleteMany({
      appId: 'app',
      ids: ['first', 'second'],
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${DEVICES_URL}?ids=first%2Csecond`,
    });
  });

  test('should get the device with its channel', async () => {
    const fetchMock = stubFetch(() => Response.json(DEVICE));

    const fetchedDevice = await new HotCodePush().apps.devices.get({
      appId: 'app',
      deviceId: 'device',
      relations: ['channel'],
    });

    expect(fetchedDevice).toEqual(DEVICE);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DEVICES_URL}/device?relations=channel`,
    });
  });

  test('should list the devices with an attribute filter', async () => {
    const fetchMock = stubFetch(() => Response.json([DEVICE]));

    const fetchedDevices = await new HotCodePush().apps.devices.list({
      appId: 'app',
      attribute: 'userId=42',
      limit: 20,
    });

    expect(fetchedDevices).toEqual([DEVICE]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${DEVICES_URL}?attribute=userId%3D42&limit=20`,
    });
  });
});
