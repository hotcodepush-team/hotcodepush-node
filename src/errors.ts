import type { ErrorBody } from './types';

/**
 * Thrown when the API answers with a status outside 2xx.
 * `code`, `message` and `details` are the API's, verbatim.
 */
export class HotCodePushError extends Error {
  public readonly code: string;
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
    code: 'E_INTERNAL',
    message: `Request failed with status ${status}.`,
  };
  return new HotCodePushError(errorBody, status);
}
