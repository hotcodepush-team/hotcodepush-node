import type { ErrorBody } from './types';

/**
 * Thrown when the API answers with a status outside 2xx.
 * `code`, `message` and `details` come from the API verbatim.
 * A code newer than this client passes through as a plain string, so `code` is not limited to `HotCodePushErrorCode`.
 * A response without the API error shape becomes `unexpected_response` with the status, and its body is dropped.
 */
export class HotCodePushError extends Error {
  public readonly code: ErrorBody['code'];
  public readonly details: unknown;
  public readonly status: number;

  constructor(errorBody: ErrorBody, status: number) {
    super(errorBody.message);
    this.code = errorBody.code;
    this.details = errorBody.details;
    this.name = 'HotCodePushError';
    this.status = status;
  }
}

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof value.code === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function resolveErrorBody(text: string): ErrorBody | undefined {
  try {
    const body: unknown = JSON.parse(text);
    return isErrorBody(body) ? body : undefined;
  } catch {
    return undefined;
  }
}

export function resolveHotCodePushError(
  status: number,
  text: string,
): HotCodePushError {
  const errorBody = resolveErrorBody(text) ?? {
    code: 'unexpected_response',
    message: `Request failed with status ${status}.`,
  };
  return new HotCodePushError(errorBody, status);
}
