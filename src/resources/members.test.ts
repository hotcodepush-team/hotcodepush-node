import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const MEMBERS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/members';
const MEMBER = { id: 'member', role: 'admin', userId: 'user' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MembersResource', () => {
  test('should delete the member', async () => {
    const fetchMock = stubFetch(() => new Response(null, { status: 204 }));

    await new HotCodePush().organizations.members.delete({
      memberId: 'member',
      organizationId: 'organization',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'DELETE',
      url: `${MEMBERS_URL}/member`,
    });
  });

  test('should get the member', async () => {
    const fetchMock = stubFetch(() => Response.json(MEMBER));

    const fetchedMember = await new HotCodePush().organizations.members.get({
      memberId: 'member',
      organizationId: 'organization',
    });

    expect(fetchedMember).toEqual(MEMBER);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${MEMBERS_URL}/member`,
    });
  });

  test('should list the members with their users when the user relation is set', async () => {
    const fetchMock = stubFetch(() => Response.json([MEMBER]));

    const fetchedMembers = await new HotCodePush().organizations.members.list({
      limit: 10,
      organizationId: 'organization',
      relations: ['user'],
    });

    expect(fetchedMembers).toEqual([MEMBER]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${MEMBERS_URL}?limit=10&relations=user`,
    });
  });

  test('should patch the role of the member', async () => {
    const fetchMock = stubFetch(() => Response.json(MEMBER));

    await new HotCodePush().organizations.members.update({
      memberId: 'member',
      organizationId: 'organization',
      role: 'admin',
    });

    expect(resolveSentRequest(fetchMock)).toMatchObject({
      body: { role: 'admin' },
      method: 'PATCH',
      url: `${MEMBERS_URL}/member`,
    });
  });
});
