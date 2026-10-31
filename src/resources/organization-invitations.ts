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

export type CountInvitationsOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations/count',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/invitations/count',
    'get'
  >;

export type CreateInvitationOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations',
  'post'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/invitations', 'post'> &
  IdempotencyOptions;

export type DeleteInvitationOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations/{invitationId}',
  'delete'
>;

export type DeleteManyInvitationsOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations',
  'delete'
> &
  QueryParameters<'/v1/organizations/{organizationId}/invitations', 'delete'>;

/**
 * An invitation without its organization, as the list and a create answer it.
 */
export type InvitationRow = JsonResponseBody<
  '/v1/organizations/{organizationId}/invitations',
  'get',
  200
>[number];

export type ListInvitationsOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/invitations', 'get'>;

export class OrganizationInvitationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the invitations of the organization that match the filters.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(options: CountInvitationsOptions): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/invitations/count',
        { organizationId },
      ),
      query,
    });
  }

  /**
   * Invites an email address to the organization. The invitation mail carries the token.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async create(
    options: CreateInvitationOptions,
  ): Promise<InvitationRow> {
    const { idempotencyKey, organizationId, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/organizations/{organizationId}/invitations', {
        organizationId,
      }),
    });
  }

  /**
   * Withdraws an invitation.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteInvitationOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/invitations/{invitationId}',
        options,
      ),
    });
  }

  /**
   * Withdraws the invitations of the organization named by `ids`, one to 100. An id of another organization is skipped.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async deleteMany(
    options: DeleteManyInvitationsOptions,
  ): Promise<void> {
    const { organizationId, ...query } = options;
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/organizations/{organizationId}/invitations', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Lists the invitations of the organization, newest first.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(options: ListInvitationsOptions): Promise<InvitationRow[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/invitations', {
        organizationId,
      }),
      query,
    });
  }
}
