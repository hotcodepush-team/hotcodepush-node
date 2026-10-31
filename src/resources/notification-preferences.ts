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
 * Whether the caller receives the notifications of one category through one medium.
 * It applies to the account or to one membership.
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
 * The notification preferences of the caller, one per category and medium.
 * They apply to the account or, with `organizationId`, to that membership.
 */
export class NotificationPreferencesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Lists the preferences of the caller, one per category and medium, defaults included.
   * The order follows the catalog, with email first.
   * Without `organizationId` it lists the account categories, with it the categories set per membership.
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
   * Sets one preference, given by category and medium, and answers it.
   * Email for a mandatory category is always on.
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
