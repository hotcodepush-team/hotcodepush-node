import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountMembersOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/count',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/members/count', 'get'>;

export type DeleteManyMembersOptions = PathParameters<
  '/v1/organizations/{organizationId}/members',
  'delete'
> &
  QueryParameters<'/v1/organizations/{organizationId}/members', 'delete'>;

export type DeleteMemberOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'delete'
>;

export type GetMemberOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'get'
> &
  QueryParameters<
    '/v1/organizations/{organizationId}/members/{memberId}',
    'get'
  >;

export type ListMembersOptions = PathParameters<
  '/v1/organizations/{organizationId}/members',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/members', 'get'>;

export type Member = JsonResponseBody<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'get',
  200
>;

/**
 * A member without its user, as an update and an accepted invitation answer it.
 */
export type MemberRow = JsonResponseBody<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'patch',
  200
>;

export type UpdateMemberOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'patch'
> &
  JsonRequestBody<
    '/v1/organizations/{organizationId}/members/{memberId}',
    'patch'
  >;

export class MembersResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the members of the organization that match the filters.
   */
  public async count(options: CountMembersOptions): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/members/count', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Removes a member. Any member may remove themselves to leave the organization.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteMemberOptions): Promise<void> {
    await this.httpClient.fetchStatus({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/{memberId}',
        options,
      ),
    });
  }

  /**
   * Removes the members of the organization named by `ids`, one to 100. An id of another organization is skipped.
   * If the set holds the Owner, the whole set is refused.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async deleteMany(options: DeleteManyMembersOptions): Promise<void> {
    const { organizationId, ...query } = options;
    await this.httpClient.fetchStatus({
      method: 'DELETE',
      path: resolvePath('/v1/organizations/{organizationId}/members', {
        organizationId,
      }),
      query,
    });
  }

  public async get(options: GetMemberOptions): Promise<Member> {
    const { memberId, organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/{memberId}',
        { memberId, organizationId },
      ),
      query,
    });
  }

  /**
   * Lists the members of the organization, newest first.
   */
  public async list(options: ListMembersOptions): Promise<Member[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/members', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Changes the role of a member. Setting `owner` transfers the ownership.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async update(options: UpdateMemberOptions): Promise<MemberRow> {
    const { memberId, organizationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/{memberId}',
        { memberId, organizationId },
      ),
    });
  }
}
