import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  QueryParameters,
} from '../types';

export type ListNotificationPreferencesOptions = QueryParameters<
  '/v1/notification-preferences',
  'get'
>;

/**
 * One notification type with what the caller receives per medium and whether that is the default or an override.
 */
export type NotificationPreference = JsonResponseBody<
  '/v1/notification-preferences',
  'patch',
  200
>;

/**
 * A category of the catalog with its types; a mandatory category's email is always on.
 */
export type NotificationPreferenceCategory = JsonResponseBody<
  '/v1/notification-preferences',
  'get',
  200
>[number];

export type UpdateNotificationPreferenceOptions = JsonRequestBody<
  '/v1/notification-preferences',
  'patch'
>;

/**
 * The caller's matrix of notification types and media, for the account or, with `organizationId`, for that membership.
 */
export class NotificationPreferencesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Every notification type grouped by category in the catalog's order: the account-scoped categories,
   * or with `organizationId` that organization's product alerts.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async list(
    options: ListNotificationPreferencesOptions = {},
  ): Promise<NotificationPreferenceCategory[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/notification-preferences'),
      query: options,
    });
  }

  /**
   * Sets one cell of the matrix, the type and the medium.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async update(
    options: UpdateNotificationPreferenceOptions,
  ): Promise<NotificationPreference> {
    return this.httpClient.fetchJson({
      body: options,
      method: 'PATCH',
      path: resolvePath('/v1/notification-preferences'),
    });
  }
}
