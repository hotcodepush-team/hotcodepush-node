import { describe, expect, test } from 'vitest';

import { HotCodePushError, resolveHotCodePushError } from './errors';

describe('resolveHotCodePushError', () => {
  test('should carry the code, message, details and status verbatim when the body has the error shape', () => {
    const body = JSON.stringify({
      code: 'E_VALIDATION',
      details: { field: 'name', rule: 'required' },
      message: 'The name is required.',
    });

    const resolvedError = resolveHotCodePushError(400, body);

    expect(resolvedError).toBeInstanceOf(HotCodePushError);
    expect(resolvedError).toMatchObject({
      code: 'E_VALIDATION',
      details: { field: 'name', rule: 'required' },
      message: 'The name is required.',
      name: 'HotCodePushError',
      status: 400,
    });
  });

  test('should fall back to E_INTERNAL when the body is not json', () => {
    const resolvedError = resolveHotCodePushError(
      502,
      '<html>Bad Gateway</html>',
    );

    expect(resolvedError).toMatchObject({
      code: 'E_INTERNAL',
      details: undefined,
      message: 'Request failed with status 502.',
      status: 502,
    });
  });

  test('should fall back to E_INTERNAL when the json lacks the error shape', () => {
    const resolvedError = resolveHotCodePushError(404, '{"error":"Not Found"}');

    expect(resolvedError).toMatchObject({ code: 'E_INTERNAL', status: 404 });
  });
});
