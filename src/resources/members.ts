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
   * The number of the organization's members under the list's filters.
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
   * Removes a member; any member may remove themselves, which is leaving the organization.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async delete(options: DeleteMemberOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/{memberId}',
        options,
      ),
    });
  }

  /**
   * Removes the organization's members named by `ids`, one to 100; an id of another organization is skipped,
   * and the Owner refuses the whole set.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async deleteMany(options: DeleteManyMembersOptions): Promise<void> {
    const { organizationId, ...query } = options;
    await this.httpClient.fetchJson({
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
   * The organization's members, newest first.
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
   * Changes a member's role; setting `owner` transfers the ownership.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async update(options: UpdateMemberOptions): Promise<Member> {
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
