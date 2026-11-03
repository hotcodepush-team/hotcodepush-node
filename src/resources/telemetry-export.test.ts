import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import {
  countAttemptsWhenUnavailable,
  resolveSentRequest,
  stubFetch,
} from '../test-helpers';

const TELEMETRY_EXPORT_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/telemetry-export';
const TELEMETRY_EXPORT = {
  disabledAt: null,
  headerNames: ['authorization'],
  signals: ['logs', 'metrics'],
  url: 'https://otlp.example.com',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TelemetryExportResource', () => {
  test('should delete the telemetry export', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.telemetryExport.delete({
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: TELEMETRY_EXPORT_URL,
    });
  });

  test('should get the telemetry export', async () => {
    const fetchMock = stubFetch(() => Response.json(TELEMETRY_EXPORT));

    const fetchedTelemetryExport =
      await new HotCodePush().organizations.telemetryExport.get({
        organizationId: 'organization',
      });

    expect(fetchedTelemetryExport).toEqual(TELEMETRY_EXPORT);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: TELEMETRY_EXPORT_URL,
    });
  });

  test('should set the url, the headers and the signals with a put', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(TELEMETRY_EXPORT, { status: 201 }),
    );

    const setTelemetryExport =
      await new HotCodePush().organizations.telemetryExport.set({
        headers: { authorization: 'Bearer vendor' },
        organizationId: 'organization',
        signals: ['logs', 'metrics'],
        url: 'https://otlp.example.com',
      });

    expect(setTelemetryExport).toEqual(TELEMETRY_EXPORT);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: {
        headers: { authorization: 'Bearer vendor' },
        signals: ['logs', 'metrics'],
        url: 'https://otlp.example.com',
      },
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
      url: TELEMETRY_EXPORT_URL,
    });
  });

  test('should post to test the telemetry export and answer the deliveries', async () => {
    const deliveries = [
      { id: 'delivery', status: 'succeeded', type: 'telemetry_export.test' },
    ];
    const fetchMock = stubFetch(() =>
      Response.json(deliveries, { status: 201 }),
    );

    const testDeliveries =
      await new HotCodePush().organizations.telemetryExport.test({
        organizationId: 'organization',
      });

    expect(testDeliveries).toEqual(deliveries);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: undefined,
      method: 'POST',
      url: `${TELEMETRY_EXPORT_URL}/test`,
    });
  });

  test('should not retry the test when the api is unavailable', async () => {
    const attemptCount = await countAttemptsWhenUnavailable(() =>
      new HotCodePush().organizations.telemetryExport.test({
        organizationId: 'organization',
      }),
    );

    expect(attemptCount).toBe(1);
  });

  test('should patch to switch the telemetry export off', async () => {
    const disabledTelemetryExport = {
      ...TELEMETRY_EXPORT,
      disabledAt: '2026-11-03T12:00:00.000Z',
    };
    const fetchMock = stubFetch(() => Response.json(disabledTelemetryExport));

    const updatedTelemetryExport =
      await new HotCodePush().organizations.telemetryExport.update({
        isEnabled: false,
        organizationId: 'organization',
      });

    expect(updatedTelemetryExport).toEqual(disabledTelemetryExport);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { isEnabled: false },
      method: 'PATCH',
      url: TELEMETRY_EXPORT_URL,
    });
  });
});
