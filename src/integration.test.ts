import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { HotCodePush } from './client';
import { HotCodePushError } from './errors';
import type { App } from './resources/apps';
import type { Channel } from './resources/channels';
import type { Organization } from './resources/organizations';

const apiBaseUrl = process.env.HOTCODEPUSH_API_BASE_URL;
const token = process.env.HOTCODEPUSH_API_TOKEN;

/**
 * Runs against a live API, by hand; see CLAUDE.md for the local setup.
 */
describe.runIf(apiBaseUrl)('the client against a running API', () => {
  const hotCodePush = new HotCodePush({ baseUrl: apiBaseUrl, token });
  const createdOrganizations: Organization[] = [];
  let app: App;
  let channel: Channel;
  let organization: Organization;

  beforeAll(() => {
    if (!token) {
      throw new Error(
        'HOTCODEPUSH_API_TOKEN must hold the bearer of a verified user.',
      );
    }
  });

  afterAll(async () => {
    for (const createdOrganization of createdOrganizations) {
      await hotCodePush.organizations.delete({
        organizationId: createdOrganization.id,
      });
    }
  });

  test('should create, get, list and update an organization', async () => {
    organization = await hotCodePush.organizations.create({
      name: 'Node Client Test',
    });
    createdOrganizations.push(organization);

    const fetchedOrganization = await hotCodePush.organizations.get({
      organizationId: organization.id,
    });
    const fetchedOrganizations = await hotCodePush.organizations.list({
      limit: 100,
    });
    const updatedOrganization = await hotCodePush.organizations.update({
      name: 'Node Client Test Renamed',
      organizationId: organization.id,
    });

    expect(organization.role).toBe('owner');
    expect(fetchedOrganization).toMatchObject({
      id: organization.id,
      plan: 'free',
    });
    expect(fetchedOrganizations.map(({ id }) => id)).toContain(organization.id);
    expect(updatedOrganization.name).toBe('Node Client Test Renamed');
  });

  test('should list the members with their users and get one', async () => {
    const fetchedMembers = await hotCodePush.organizations.members.list({
      organizationId: organization.id,
      relations: ['user'],
    });
    const [owner] = fetchedMembers;
    if (owner === undefined) {
      throw new Error('The organization has no member.');
    }
    const fetchedMember = await hotCodePush.organizations.members.get({
      memberId: owner.id,
      organizationId: organization.id,
    });

    expect(owner.user?.email).toEqual(expect.any(String));
    expect(fetchedMember).toMatchObject({ id: owner.id, role: 'owner' });
  });

  test('should create, list and withdraw an invitation', async () => {
    const createdInvitation =
      await hotCodePush.organizations.invitations.create({
        email: 'invitee@example.com',
        organizationId: organization.id,
        role: 'member',
      });
    const fetchedInvitations = await hotCodePush.organizations.invitations.list(
      { organizationId: organization.id },
    );
    await hotCodePush.organizations.invitations.delete({
      invitationId: createdInvitation.id,
      organizationId: organization.id,
    });
    const pendingInvitations = await hotCodePush.invitations.list();

    expect(createdInvitation).toMatchObject({ status: 'pending' });
    expect(fetchedInvitations.map(({ id }) => id)).toContain(
      createdInvitation.id,
    );
    expect(pendingInvitations).toEqual(expect.any(Array));
  });

  test('should create, get, list and update an app', async () => {
    app = await hotCodePush.organizations.apps.create({
      framework: 'capacitor',
      name: 'Node Client Demo',
      organizationId: organization.id,
    });

    const fetchedApp = await hotCodePush.apps.get({ appId: app.id });
    const fetchedApps = await hotCodePush.organizations.apps.list({
      organizationId: organization.id,
    });
    const updatedApp = await hotCodePush.apps.update({
      appId: app.id,
      channelLinkTemplate: 'demo://channels/{channelId}',
    });

    expect(fetchedApp).toMatchObject({ id: app.id, name: 'Node Client Demo' });
    expect(fetchedApps.map(({ id }) => id)).toEqual([app.id]);
    expect(updatedApp.channelLinkTemplate).toBe('demo://channels/{channelId}');
  });

  test('should create, get, list, update, pause and resume a channel', async () => {
    channel = await hotCodePush.apps.channels.create({
      appId: app.id,
      name: 'staging',
    });

    const fetchedChannel = await hotCodePush.apps.channels.get({
      appId: app.id,
      channelId: channel.id,
    });
    const fetchedChannels = await hotCodePush.apps.channels.list({
      appId: app.id,
    });
    const updatedChannel = await hotCodePush.apps.channels.update({
      appId: app.id,
      channelId: channel.id,
      isDiscoverable: true,
    });
    const pausedChannel = await hotCodePush.apps.channels.pause({
      appId: app.id,
      channelId: channel.id,
    });
    const resumedChannel = await hotCodePush.apps.channels.resume({
      appId: app.id,
      channelId: channel.id,
    });

    expect(fetchedChannel).toMatchObject({ activeDeviceCount: 0 });
    expect(fetchedChannels.map(({ name }) => name).sort()).toEqual([
      'production',
      'staging',
    ]);
    expect(updatedChannel.isDiscoverable).toBe(true);
    expect(pausedChannel.pausedAt).toEqual(expect.any(String));
    expect(resumedChannel.pausedAt).toBeNull();
  });

  test("should get the channel's index", async () => {
    const fetchedChannelIndex = await hotCodePush.apps.channels.indexes.get({
      appId: app.id,
      channelId: channel.id,
      platform: 'android',
    });

    expect(fetchedChannelIndex).toEqual(expect.any(Object));
  });

  test('should list no releases for a new channel', async () => {
    const fetchedChannelReleases =
      await hotCodePush.apps.channels.releases.list({
        appId: app.id,
        channelId: channel.id,
        relations: ['bundle'],
      });
    const fetchedReleases = await hotCodePush.apps.releases.list({
      appId: app.id,
      channelId: channel.id,
    });

    expect(fetchedChannelReleases).toEqual([]);
    expect(fetchedReleases).toEqual([]);
  });

  test("should pass the API's error through when there is nothing to roll back", async () => {
    const rollbackPromise = hotCodePush.apps.channels.rollbacks.create({
      appId: app.id,
      channelId: channel.id,
    });

    await expect(rollbackPromise).rejects.toBeInstanceOf(HotCodePushError);
    await expect(rollbackPromise).rejects.toMatchObject({
      code: 'E_VALIDATION',
      details: { field: 'toReleaseId' },
      status: 400,
    });
  });

  test('should delete the channel', async () => {
    await hotCodePush.apps.channels.delete({
      appId: app.id,
      channelId: channel.id,
    });

    await expect(
      hotCodePush.apps.channels.get({ appId: app.id, channelId: channel.id }),
    ).rejects.toMatchObject({ code: 'E_NOT_FOUND', status: 404 });
  });

  test('should transfer the app to another organization', async () => {
    const targetOrganization = await hotCodePush.organizations.create({
      name: 'Node Client Test Target',
    });
    createdOrganizations.push(targetOrganization);

    const transferredApp = await hotCodePush.apps.transfer({
      appId: app.id,
      organizationId: targetOrganization.id,
    });

    expect(transferredApp.organizationId).toBe(targetOrganization.id);
  });

  test('should delete the app', async () => {
    await hotCodePush.apps.delete({ appId: app.id });

    await expect(hotCodePush.apps.get({ appId: app.id })).rejects.toMatchObject(
      { code: 'E_NOT_FOUND', status: 404 },
    );
  });
});
