import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { Invitation } from './invitations';

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

export type ListInvitationsOptions = PathParameters<
  '/v1/organizations/{organizationId}/invitations',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/invitations', 'get'>;

export class OrganizationInvitationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the organization's invitations under the list's filters.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
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
   * Invites an address to the organization; the invitation mail carries the token.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async create(options: CreateInvitationOptions): Promise<Invitation> {
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
   * An API token answers `E_FORBIDDEN`; sign in with a session.
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
   * Withdraws the organization's invitations named by `ids`, one to 100; an id of another organization is skipped.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
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
   * The organization's invitations, newest first.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async list(options: ListInvitationsOptions): Promise<Invitation[]> {
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
