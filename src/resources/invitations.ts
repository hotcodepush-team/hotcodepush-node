import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { MemberRow } from './members';

export type AcceptInvitationOptions = PathParameters<
  '/v1/invitations/{invitationId}/accept',
  'post'
> &
  JsonRequestBody<'/v1/invitations/{invitationId}/accept', 'post'>;

export type Invitation = JsonResponseBody<
  '/v1/invitations',
  'get',
  200
>[number];

export type ListCallerInvitationsOptions = QueryParameters<
  '/v1/invitations',
  'get'
>;

export class InvitationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Accepts an invitation addressed to the caller with the token from its mail.
   * A repeat answers `invitation_invalid`, so the call is never retried.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async accept(options: AcceptInvitationOptions): Promise<MemberRow> {
    const { invitationId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/invitations/{invitationId}/accept', {
        invitationId,
      }),
    });
  }

  /**
   * The number of the caller's pending invitations across organizations.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async count(): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/invitations/count'),
    });
  }

  /**
   * The caller's pending invitations across organizations, newest first; `relations: ['organization']` embeds each one's organization as its id and name.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async list(
    options: ListCallerInvitationsOptions = {},
  ): Promise<Invitation[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/invitations'),
      query: options,
    });
  }
}
