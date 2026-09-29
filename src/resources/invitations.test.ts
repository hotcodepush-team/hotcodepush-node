import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const INVITATIONS_URL = 'https://api.hotcodepush.com/v1/invitations';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('InvitationsResource', () => {
  test('should post the token to accept the invitation', async () => {
    const member = { id: 'member', role: 'member' };
    const fetchMock = stubFetch(() => Response.json(member, { status: 201 }));

    const acceptedMember = await new HotCodePush().invitations.accept({
      invitationId: 'invitation',
      token: 'token',
    });

    expect(acceptedMember).toEqual(member);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { token: 'token' },
      method: 'POST',
      url: `${INVITATIONS_URL}/invitation/accept`,
    });
  });

  test("should list the caller's pending invitations", async () => {
    const invitation = { id: 'invitation', status: 'pending' };
    const fetchMock = stubFetch(() => Response.json([invitation]));

    const fetchedInvitations = await new HotCodePush().invitations.list();

    expect(fetchedInvitations).toEqual([invitation]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: INVITATIONS_URL,
    });
  });
});
