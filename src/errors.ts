import type { ErrorBody, HotCodePushErrorCode } from './types';

/**
 * Thrown when the API answers with a status outside 2xx.
 * `code`, `message` and `details` are the API's, verbatim; a response outside the API's error shape
 * is `E_UNEXPECTED_RESPONSE` with the status, its body left out.
 */
export class HotCodePushError extends Error {
  public readonly code: HotCodePushErrorCode;
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
    code: 'E_UNEXPECTED_RESPONSE',
    message: `Request failed with status ${status}.`,
  };
  return new HotCodePushError(errorBody, status);
}
