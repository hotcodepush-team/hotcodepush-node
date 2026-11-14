import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from './client';
import { HotCodePushError } from './errors';
import { resolveSentRequest, stubFetch } from './test-helpers';
import type { ErrorBody } from './types';

afterEach(() => {
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
      method: 'POST',
      url: 'https://api.hotcodepush.com/v1/apps/app-id/channels?relations=app',
    });
  });

  test('should send nothing beyond the method, the path and the body when more is passed', async () => {
    const fetchMock = stubFetch();
    const options = {
      headers: { 'X-Other': 'value' },
      method: 'GET',
      path: '/health',
    } as const;

    await new HotCodePush().request(options);

    expect(resolveSentRequest(fetchMock).headers).not.toHaveProperty('X-Other');
  });

  test('should return the status, the headers and the body, already received, when the body is not JSON', async () => {
    const servedResponse = new Response('appId,appName\n', {
      headers: { 'Content-Type': 'text/csv' },
    });
    stubFetch(() => servedResponse);

    const response = await new HotCodePush().request({
      method: 'GET',
      path: '/v1/organizations/organization-id/usage/apps?format=csv',
    });

    expect(servedResponse.bodyUsed).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv');
    expect(await response.text()).toBe('appId,appName\n');
  });

  test('should return the response when the answer has no body', async () => {
    stubFetch(() => new Response(null, { status: 204 }));

    const response = await new HotCodePush().request({
      method: 'DELETE',
      path: '/v1/apps/app-id',
    });

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  test('should throw the error of the API when the status is outside 2xx', async () => {
    const errorBody: ErrorBody = {
      code: 'not_found',
      message: 'The app does not exist.',
    };
    stubFetch(() => Response.json(errorBody, { status: 404 }));

    const requestPromise = new HotCodePush().request({
      method: 'GET',
      path: '/v1/apps/app-id',
    });

    await expect(requestPromise).rejects.toThrow(HotCodePushError);
    await expect(requestPromise).rejects.toMatchObject({
      ...errorBody,
      status: 404,
    });
  });
});
