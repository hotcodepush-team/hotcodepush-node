import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from './client';
import { HotCodePushError } from './errors';
import { resolveSentRequest, stubFetch } from './test-helpers';
import type { ErrorBody } from './types';

beforeEach(() => {
  vi.stubEnv('HOTCODEPUSH_TOKEN', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('HotCodePush.request', () => {
  test('should send the method, the path with its query string and the body as JSON', async () => {
    const fetchMock = stubFetch();

    await new HotCodePush().request({
      body: { name: 'beta' },
      method: 'POST',
      path: '/v1/apps/app-id/channels?relations=app',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { name: 'beta' },
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/apps/app-id/channels?relations=app',
    });
  });

  test('should return the response as received when the body is not JSON', async () => {
    stubFetch(
      () =>
        new Response('appId,appName\n', {
          headers: { 'Content-Type': 'text/csv' },
        }),
    );

    const response = await new HotCodePush().request({
      method: 'GET',
      path: '/v1/organizations/organization-id/usage/apps?format=csv',
    });

    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(await response.text()).toBe('appId,appName\n');
  });

  test('should throw the error of the API when the status is outside 2xx', async () => {
    const errorBody: ErrorBody = {
      code: 'not_found',
      message: 'The app does not exist.',
    };
    stubFetch(() => Response.json(errorBody, { status: 404 }));

    const request = new HotCodePush().request({
      method: 'GET',
      path: '/v1/apps/app-id',
    });

    await expect(request).rejects.toThrow(HotCodePushError);
    await expect(request).rejects.toMatchObject({ ...errorBody, status: 404 });
  });

  test('should refuse the path when it does not start with a slash', async () => {
    const fetchMock = stubFetch();

    const request = new HotCodePush().request({
      method: 'GET',
      path: 'v1/apps',
    });

    await expect(request).rejects.toThrow(
      'The path v1/apps does not start with a slash.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
