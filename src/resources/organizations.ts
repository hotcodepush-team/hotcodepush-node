import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import { AuditLogsResource } from './audit-logs';
import { MembersResource } from './members';
import { OrganizationAppsResource } from './organization-apps';
import { OrganizationInvitationsResource } from './organization-invitations';
import { SsoProviderResource } from './sso-provider';

export type CreateOrganizationOptions = JsonRequestBody<
  '/v1/organizations',
  'post'
> &
  IdempotencyOptions;

export type DeleteOrganizationOptions = PathParameters<
  '/v1/organizations/{organizationId}',
  'delete'
>;

export type GetOrganizationOptions = PathParameters<
  '/v1/organizations/{organizationId}',
  'get'
>;

export type ListOrganizationsOptions = QueryParameters<
  '/v1/organizations',
  'get'
>;

export type Organization = JsonResponseBody<
  '/v1/organizations/{organizationId}',
  'get',
  200
>;

export type UpdateOrganizationOptions = PathParameters<
  '/v1/organizations/{organizationId}',
  'patch'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}', 'patch'>;

export class OrganizationsResource {
  public readonly apps: OrganizationAppsResource;
  public readonly auditLogs: AuditLogsResource;
  public readonly invitations: OrganizationInvitationsResource;
  public readonly members: MembersResource;
  public readonly ssoProvider: SsoProviderResource;

  constructor(private readonly httpClient: HttpClient) {
    this.apps = new OrganizationAppsResource(httpClient);
    this.auditLogs = new AuditLogsResource(httpClient);
    this.invitations = new OrganizationInvitationsResource(httpClient);
    this.members = new MembersResource(httpClient);
    this.ssoProvider = new SsoProviderResource(httpClient);
  }

  /**
   * The number of the caller's organizations.
   */
  public async count(): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/count'),
    });
  }

  /**
   * Creates an organization with the caller as its Owner.
   */
  public async create(
    options: CreateOrganizationOptions,
  ): Promise<Organization> {
    const { idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/organizations'),
    });
  }

  /**
   * Soft-deletes an organization with everything under it: gone at once, hard-deleted after seven days.
   */
  public async delete(options: DeleteOrganizationOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/organizations/{organizationId}', options),
    });
  }

  public async get(options: GetOrganizationOptions): Promise<Organization> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}', options),
    });
  }

  /**
   * The caller's organizations with their roles, newest first.
   */
  public async list(
    options: ListOrganizationsOptions = {},
  ): Promise<Organization[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations'),
      query: options,
    });
  }

  public async update(
    options: UpdateOrganizationOptions,
  ): Promise<Organization> {
    const { organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/organizations/{organizationId}', {
        organizationId,
      }),
    });
  }
}
