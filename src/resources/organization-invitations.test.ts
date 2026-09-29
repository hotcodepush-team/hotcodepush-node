import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const INVITATIONS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/invitations';
const INVITATION = { email: 'jane@example.com', id: 'invitation' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('OrganizationInvitationsResource', () => {
  test('should post the invitation with its idempotency key', async () => {
    const fetchMock = stubFetch(() =>
      Response.json(INVITATION, { status: 201 }),
    );

    const createdInvitation =
      await new HotCodePush().organizations.invitations.create({
        email: 'jane@example.com',
        idempotencyKey: 'key',
        organizationId: 'organization',
        role: 'member',
      });

    expect(createdInvitation).toEqual(INVITATION);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { email: 'jane@example.com', role: 'member' },
      headers: { 'Idempotency-Key': 'key' },
      method: 'POST',
      url: INVITATIONS_URL,
    });
  });

  test('should delete the invitation', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.invitations.delete({
      invitationId: 'invitation',
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${INVITATIONS_URL}/invitation`,
    });
  });

  test('should list the invitations of the organization', async () => {
    const fetchMock = stubFetch(() => Response.json([INVITATION]));

    const fetchedInvitations =
      await new HotCodePush().organizations.invitations.list({
        limit: 5,
        organizationId: 'organization',
      });

    expect(fetchedInvitations).toEqual([INVITATION]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${INVITATIONS_URL}?limit=5`,
    });
  });
});
