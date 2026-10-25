import { describe, expect, test } from 'vitest';

import { HotCodePushError, resolveHotCodePushError } from './errors';
import type { ErrorBody } from './types';

describe('resolveHotCodePushError', () => {
  test('should carry the code, message, details and status verbatim when the body has the error shape', () => {
    const body = JSON.stringify({
      code: 'validation',
      details: { field: 'name', rule: 'required' },
      message: 'The name is required.',
    } satisfies ErrorBody);

    const resolvedError = resolveHotCodePushError(400, body);

    expect(resolvedError).toBeInstanceOf(HotCodePushError);
    expect(resolvedError).toMatchObject({
      code: 'validation',
      details: { field: 'name', rule: 'required' },
      message: 'The name is required.',
      name: 'HotCodePushError',
      status: 400,
    });
  });

  test('should answer unexpected_response with the status and without the body when the body is html', () => {
    const resolvedError = resolveHotCodePushError(
      429,
      '<html>Too Many Requests</html>',
    );

    expect(resolvedError).toMatchObject({
      code: 'unexpected_response',
      details: undefined,
      message: 'Request failed with status 429.',
      status: 429,
    });
  });

  test('should answer unexpected_response with the status and without the body when the body is plain text', () => {
    const resolvedError = resolveHotCodePushError(503, 'unavailable');

    expect(resolvedError).toMatchObject({
      code: 'unexpected_response',
      message: 'Request failed with status 503.',
      status: 503,
    });
  });

  test('should answer unexpected_response when the json lacks the error shape', () => {
    const resolvedError = resolveHotCodePushError(404, '{"error":"Not Found"}');

    expect(resolvedError).toMatchObject({
      code: 'unexpected_response',
      status: 404,
    });
  });
});
