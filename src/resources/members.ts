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
>;

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
   * The number of the organization's members.
   */
  public async count(options: CountMembersOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/organizations/{organizationId}/members/count',
        options,
      ),
    });
  }

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
