/**
 * The one error shape every API error answers with.
 */
export interface ErrorBody {
  code: string;
  details?: unknown;
  message: string;
}
