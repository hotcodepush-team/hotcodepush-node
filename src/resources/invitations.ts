import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
} from '../types';
import type { Member } from './members';

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

export class InvitationsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Accepts an invitation addressed to the caller with the token from its mail.
   * A repeat answers `E_INVITATION_INVALID`, so the call is never retried.
   */
  public async accept(options: AcceptInvitationOptions): Promise<Member> {
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
   */
  public async count(): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/invitations/count'),
    });
  }

  /**
   * The caller's pending invitations across organizations, newest first.
   */
  public async list(): Promise<Invitation[]> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/invitations'),
    });
  }
}
