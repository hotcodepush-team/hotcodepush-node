import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountNotificationsOptions = QueryParameters<
  '/v1/notifications/count',
  'get'
>;

export type ListNotificationsOptions = QueryParameters<
  '/v1/notifications',
  'get'
>;

/**
 * An in-app notification of the caller, its `organizationId` null for one about the account.
 */
export type Notification = JsonResponseBody<
  '/v1/notifications/{notificationId}',
  'patch',
  200
>;

export type UpdateManyNotificationsOptions = JsonRequestBody<
  '/v1/notifications',
  'patch'
>;

export type UpdateNotificationOptions = PathParameters<
  '/v1/notifications/{notificationId}',
  'patch'
> &
  JsonRequestBody<'/v1/notifications/{notificationId}', 'patch'>;

/**
 * The caller's in-app notifications across every organization.
 */
export class NotificationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the caller's notifications under the list's filters; `isRead: 'false'` is the bell's badge.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async count(options: CountNotificationsOptions = {}): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/notifications/count'),
      query: options,
    });
  }

  /**
   * The caller's notifications, newest first.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async list(
    options: ListNotificationsOptions = {},
  ): Promise<Notification[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/notifications'),
      query: options,
    });
  }

  /**
   * Marks one of the caller's notifications read.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async update(
    options: UpdateNotificationOptions,
  ): Promise<Notification> {
    const { notificationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/notifications/{notificationId}', {
        notificationId,
      }),
    });
  }

  /**
   * Marks every unread notification of the caller read.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async updateMany(
    options: UpdateManyNotificationsOptions,
  ): Promise<void> {
    await this.httpClient.fetchJson({
      body: options,
      method: 'PATCH',
      path: resolvePath('/v1/notifications'),
    });
  }
}
