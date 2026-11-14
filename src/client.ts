import type { FetchJsonOptions, HttpClientOptions } from './http-client';
import { HttpClient } from './http-client';
import { AppsResource } from './resources/apps';
import { HealthResource } from './resources/health';
import { InvitationsResource } from './resources/invitations';
import { NotificationPreferencesResource } from './resources/notification-preferences';
import { NotificationsResource } from './resources/notifications';
import { OrganizationsResource } from './resources/organizations';
import { QrCodesResource } from './resources/qr-codes';
import { UsersResource } from './resources/users';

export type HotCodePushOptions = HttpClientOptions;

export interface RequestOptions {
  /** The body, an object or an array, sent as JSON. A `GET` takes none. */
  body?: unknown;
  /** A `DELETE`, a `GET` and a `PUT` are retried, a `PATCH` and a `POST` are sent once and carry no `Idempotency-Key`. */
  method: FetchJsonOptions['method'];
  /** The path below the base URL with its query string, starting with a slash, such as `/v1/apps?limit=10`. */
  path: string;
}

/**
 * The client for the HotCodePush REST API.
 * Resources mirror the API paths, so `/v1/apps/{appId}/channels` is `apps.channels`.
 */
export class HotCodePush {
  public readonly apps: AppsResource;
  public readonly health: HealthResource;
  public readonly invitations: InvitationsResource;
  public readonly notificationPreferences: NotificationPreferencesResource;
  public readonly notifications: NotificationsResource;
  public readonly organizations: OrganizationsResource;
  public readonly qrCodes: QrCodesResource;
  public readonly users: UsersResource;

  private readonly httpClient: HttpClient;

  constructor(options: HotCodePushOptions = {}) {
    this.httpClient = new HttpClient(options);
    this.apps = new AppsResource(this.httpClient);
    this.health = new HealthResource(this.httpClient);
    this.invitations = new InvitationsResource(this.httpClient);
    this.notificationPreferences = new NotificationPreferencesResource(
      this.httpClient,
    );
    this.notifications = new NotificationsResource(this.httpClient);
    this.organizations = new OrganizationsResource(this.httpClient);
    this.qrCodes = new QrCodesResource(this.httpClient);
    this.users = new UsersResource(this.httpClient);
  }

  /**
   * Sends one request to a path of the API, for what no resource method covers.
   * Returns the response with its status, its headers and its body already received.
   * Throws a `HotCodePushError` on a status outside 2xx.
   */
  public request({ body, method, path }: RequestOptions): Promise<Response> {
    return this.httpClient.fetchBufferedResponse({ body, method, path });
  }
}
