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
 * Whether the caller receives one category's notifications through one medium, for the account or one membership.
 */
export type NotificationPreference = JsonResponseBody<
  '/v1/notification-preferences',
  'patch',
  200
>;

export type UpdateNotificationPreferenceOptions = JsonRequestBody<
  '/v1/notification-preferences',
  'patch'
>;

/**
 * The caller's notification preferences, one per category and medium, for the account or, with `organizationId`, for that membership.
 */
export class NotificationPreferencesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * One preference per category and each medium its notifications reach, the defaults included, in the catalog's order
   * and email first: the categories set for the account, or with `organizationId` those set per membership.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(
    options: ListNotificationPreferencesOptions = {},
  ): Promise<NotificationPreference[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/notification-preferences'),
      query: options,
    });
  }

  /**
   * Sets one preference, the category and the medium, and answers it; a mandatory category's email is always on.
   * An API token answers `forbidden`; sign in with a session.
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
