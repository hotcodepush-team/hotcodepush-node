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

  test.each([
    { body: '<html>Too Many Requests</html>', condition: 'is not json' },
    { body: '{"error":"Not Found"}', condition: 'lacks the error shape' },
  ])(
    'should answer unexpected_response with the status and without the body when the body $condition',
    ({ body }) => {
      const resolvedError = resolveHotCodePushError(429, body);

      expect(resolvedError).toMatchObject({
        code: 'unexpected_response',
        details: undefined,
        message: 'Request failed with status 429.',
        status: 429,
      });
    },
  );
});
