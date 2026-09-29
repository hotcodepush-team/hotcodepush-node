import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type DeleteMemberOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'delete'
>;

export type GetMemberOptions = PathParameters<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'get'
>;

export type ListMembersOptions = PathParameters<
  '/v1/organizations/{organizationId}/members',
  'get'
> &
  Omit<
    QueryParameters<'/v1/organizations/{organizationId}/members', 'get'>,
    'relations'
  > & {
    /**
     * The linked rows to embed in each member.
     */
    relations?: readonly MemberRelation[];
  };

export type Member = JsonResponseBody<
  '/v1/organizations/{organizationId}/members/{memberId}',
  'get',
  200
>;

/**
 * The document types `relations` as a free string; the allow-list is the API's.
 */
export type MemberRelation = 'user';

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
   * Removes a member; any member may remove themselves, which is leaving the organization.
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

  public async get(options: GetMemberOptions): Promise<Member> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/{memberId}',
        options,
      ),
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
