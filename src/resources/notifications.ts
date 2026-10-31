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
 * An in-app notification of the caller.
 * `organizationId` is null for a notification about the account.
 */
export type Notification = JsonResponseBody<
  '/v1/notifications',
  'get',
  200
>[number];

/**
 * A notification without its relations, as an update answers it.
 */
export type NotificationRow = JsonResponseBody<
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
 * The in-app notifications of the caller across all organizations.
 */
export class NotificationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the notifications of the caller that match the filters.
   * `isRead: false` gives the badge count of the bell.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(options: CountNotificationsOptions = {}): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/notifications/count'),
      query: options,
    });
  }

  /**
   * Lists the notifications of the caller, newest first.
   * An API token answers `forbidden`; sign in with a session.
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
   * Marks one notification of the caller as read.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async update(
    options: UpdateNotificationOptions,
  ): Promise<NotificationRow> {
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
   * Marks every unread notification of the caller as read.
   * An API token answers `forbidden`; sign in with a session.
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
