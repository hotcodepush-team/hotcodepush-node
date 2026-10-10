import type { HttpClientOptions } from './http-client';
import { HttpClient } from './http-client';
import { AppsResource } from './resources/apps';
import { HealthResource } from './resources/health';
import { InvitationsResource } from './resources/invitations';
import { NotificationPreferencesResource } from './resources/notification-preferences';
import { NotificationsResource } from './resources/notifications';
import { OrganizationsResource } from './resources/organizations';
import { UsersResource } from './resources/users';

export type HotCodePushOptions = HttpClientOptions;

/**
 * The client for the HotCodePush REST API.
 * Resources mirror the paths: `/v1/organizations/{organizationId}/apps` is `organizations.apps`,
 * `/v1/apps/{appId}/channels` is `apps.channels`.
 */
export class HotCodePush {
  public readonly apps: AppsResource;
  public readonly health: HealthResource;
  public readonly invitations: InvitationsResource;
  public readonly notificationPreferences: NotificationPreferencesResource;
  public readonly notifications: NotificationsResource;
  public readonly organizations: OrganizationsResource;
  public readonly users: UsersResource;

  constructor(options: HotCodePushOptions = {}) {
    const httpClient = new HttpClient(options);
    this.apps = new AppsResource(httpClient);
    this.health = new HealthResource(httpClient);
    this.invitations = new InvitationsResource(httpClient);
    this.notificationPreferences = new NotificationPreferencesResource(
      httpClient,
    );
    this.notifications = new NotificationsResource(httpClient);
    this.organizations = new OrganizationsResource(httpClient);
    this.users = new UsersResource(httpClient);
  }
}
