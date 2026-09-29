import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from './client';
import { HttpClient } from './http-client';
import { resolveSentRequest, stubFetch } from './test-helpers';

interface OpenApiOperation {
  parameters?: { in: string; name: string }[];
  requestBody?: unknown;
}

interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

const APP_ID = '7c0f3a52-1d8e-4b6a-9f21-5e3c8a0d4b17';
const BUNDLE_ID = '2a9e6c14-8b3f-4d70-a5e2-91c7f0b3d864';
const CHANNEL_ID = 'e41b7d09-3c6a-4f85-b2d1-6a8f0c9e3b52';
const INVITATION_ID = '9d3c5e81-6f2a-4b07-8c14-3e7a1f9b0d26';
const MEMBER_ID = '5b8a2f47-0e9c-4d31-a6b8-2c4f7e1d9a03';
const ORGANIZATION_ID = 'c6e0b3a8-4d1f-4a92-b7e5-8f3d2c0a6b19';
const RELEASE_ID = '0f7d4c2b-9a6e-4e18-83b5-d1c9a7f2e604';

/**
 * One call per resource method with every option it can send, so a path, method,
 * query parameter or body the document lacks fails here.
 */
const CALLS: Record<string, (hotCodePush: HotCodePush) => Promise<unknown>> = {
  'apps.channels.create': hotCodePush =>
    hotCodePush.apps.channels.create({
      appId: APP_ID,
      idempotencyKey: 'key',
      isProtected: true,
      name: 'staging',
    }),
  'apps.channels.delete': hotCodePush =>
    hotCodePush.apps.channels.delete({ appId: APP_ID, channelId: CHANNEL_ID }),
  'apps.channels.get': hotCodePush =>
    hotCodePush.apps.channels.get({ appId: APP_ID, channelId: CHANNEL_ID }),
  'apps.channels.indexes.get': hotCodePush =>
    hotCodePush.apps.channels.indexes.get({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      platform: 'android',
    }),
  'apps.channels.list': hotCodePush =>
    hotCodePush.apps.channels.list({ appId: APP_ID, limit: 10, offset: 10 }),
  'apps.channels.pause': hotCodePush =>
    hotCodePush.apps.channels.pause({ appId: APP_ID, channelId: CHANNEL_ID }),
  'apps.channels.releases.create': hotCodePush =>
    hotCodePush.apps.channels.releases.create({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      channelId: CHANNEL_ID,
      idempotencyKey: 'key',
      isMandatory: true,
    }),
  'apps.channels.releases.list': hotCodePush =>
    hotCodePush.apps.channels.releases.list({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      limit: 10,
      offset: 10,
      relations: ['bundle'],
    }),
  'apps.channels.resume': hotCodePush =>
    hotCodePush.apps.channels.resume({ appId: APP_ID, channelId: CHANNEL_ID }),
  'apps.channels.rollbacks.create': hotCodePush =>
    hotCodePush.apps.channels.rollbacks.create({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      idempotencyKey: 'key',
      toReleaseId: RELEASE_ID,
    }),
  'apps.channels.update': hotCodePush =>
    hotCodePush.apps.channels.update({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      name: 'beta',
    }),
  'apps.delete': hotCodePush => hotCodePush.apps.delete({ appId: APP_ID }),
  'apps.get': hotCodePush => hotCodePush.apps.get({ appId: APP_ID }),
  'apps.releases.get': hotCodePush =>
    hotCodePush.apps.releases.get({
      appId: APP_ID,
      relations: ['counters'],
      releaseId: RELEASE_ID,
    }),
  'apps.releases.list': hotCodePush =>
    hotCodePush.apps.releases.list({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      channelId: CHANNEL_ID,
      limit: 10,
      offset: 10,
      state: 'active',
    }),
  'apps.releases.pause': hotCodePush =>
    hotCodePush.apps.releases.pause({ appId: APP_ID, releaseId: RELEASE_ID }),
  'apps.releases.resume': hotCodePush =>
    hotCodePush.apps.releases.resume({ appId: APP_ID, releaseId: RELEASE_ID }),
  'apps.releases.revoke': hotCodePush =>
    hotCodePush.apps.releases.revoke({ appId: APP_ID, releaseId: RELEASE_ID }),
  'apps.releases.update': hotCodePush =>
    hotCodePush.apps.releases.update({
      appId: APP_ID,
      releaseId: RELEASE_ID,
      rolloutPercentage: 50,
    }),
  'apps.transfer': hotCodePush =>
    hotCodePush.apps.transfer({
      appId: APP_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'apps.update': hotCodePush =>
    hotCodePush.apps.update({ appId: APP_ID, name: 'Demo' }),
  'invitations.accept': hotCodePush =>
    hotCodePush.invitations.accept({
      invitationId: INVITATION_ID,
      token: 'token',
    }),
  'invitations.list': hotCodePush => hotCodePush.invitations.list(),
  'organizations.apps.create': hotCodePush =>
    hotCodePush.organizations.apps.create({
      framework: 'capacitor',
      idempotencyKey: 'key',
      name: 'Demo',
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.apps.list': hotCodePush =>
    hotCodePush.organizations.apps.list({
      limit: 10,
      offset: 10,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.create': hotCodePush =>
    hotCodePush.organizations.create({ idempotencyKey: 'key', name: 'Acme' }),
  'organizations.delete': hotCodePush =>
    hotCodePush.organizations.delete({ organizationId: ORGANIZATION_ID }),
  'organizations.get': hotCodePush =>
    hotCodePush.organizations.get({ organizationId: ORGANIZATION_ID }),
  'organizations.invitations.create': hotCodePush =>
    hotCodePush.organizations.invitations.create({
      email: 'jane@example.com',
      idempotencyKey: 'key',
      organizationId: ORGANIZATION_ID,
      role: 'member',
    }),
  'organizations.invitations.delete': hotCodePush =>
    hotCodePush.organizations.invitations.delete({
      invitationId: INVITATION_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.invitations.list': hotCodePush =>
    hotCodePush.organizations.invitations.list({
      limit: 10,
      offset: 10,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.list': hotCodePush =>
    hotCodePush.organizations.list({ limit: 10, offset: 10 }),
  'organizations.members.delete': hotCodePush =>
    hotCodePush.organizations.members.delete({
      memberId: MEMBER_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.members.get': hotCodePush =>
    hotCodePush.organizations.members.get({
      memberId: MEMBER_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.members.list': hotCodePush =>
    hotCodePush.organizations.members.list({
      limit: 10,
      offset: 10,
      organizationId: ORGANIZATION_ID,
      relations: ['user'],
    }),
  'organizations.members.update': hotCodePush =>
    hotCodePush.organizations.members.update({
      memberId: MEMBER_ID,
      organizationId: ORGANIZATION_ID,
      role: 'admin',
    }),
  'organizations.update': hotCodePush =>
    hotCodePush.organizations.update({
      name: 'Acme',
      organizationId: ORGANIZATION_ID,
    }),
  'users.delete': hotCodePush => hotCodePush.users.delete({ userId: 'me' }),
};

/**
 * `/health` is outside the document by the path rule.
 */
const UNDOCUMENTED_RESOURCES = ['health'];

const openApiDocument = JSON.parse(
  readFileSync(new URL('../openapi.json', import.meta.url), 'utf8'),
) as OpenApiDocument;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the OpenAPI snapshot', () => {
  test('should hold a call for every resource method', () => {
    const resourceMethodNames = Object.entries(new HotCodePush())
      .filter(([name]) => !UNDOCUMENTED_RESOURCES.includes(name))
      .flatMap(([name, resource]) =>
        resolveResourceMethodNames(resource as object, name),
      );

    expect(Object.keys(CALLS).sort()).toEqual(resourceMethodNames.sort());
  });

  test.each(Object.entries(CALLS))(
    'should document the path, method, query and body %s sends',
    async (_name, callResourceMethod) => {
      const fetchMock = stubFetch();

      await callResourceMethod(new HotCodePush());

      const sentRequest = resolveSentRequest(fetchMock);
      const url = new URL(sentRequest.url);
      const operation = resolveOperation(sentRequest.method, url.pathname);
      const documentedQueryNames = (operation?.parameters ?? [])
        .filter(parameter => parameter.in === 'query')
        .map(parameter => parameter.name);
      expect(
        operation,
        `${sentRequest.method} ${url.pathname} is not in openapi.json`,
      ).toBeDefined();
      expect(documentedQueryNames).toEqual(
        expect.arrayContaining([...url.searchParams.keys()]),
      );
      expect(sentRequest.body !== undefined).toBe(
        operation?.requestBody !== undefined,
      );
    },
  );
});

function resolveOperation(
  method: string,
  pathname: string,
): OpenApiOperation | undefined {
  const matchedPathItem = Object.entries(openApiDocument.paths).find(
    ([template]) => resolveTemplatePattern(template).test(pathname),
  )?.[1];
  return matchedPathItem?.[method.toLowerCase()];
}

function resolveResourceMethodNames(resource: object, path: string): string[] {
  const methodNames = Object.getOwnPropertyNames(
    Object.getPrototypeOf(resource),
  )
    .filter(name => name !== 'constructor')
    .map(name => `${path}.${name}`);
  const nestedMethodNames = Object.entries(resource)
    .filter(([, value]) => !(value instanceof HttpClient))
    .flatMap(([name, value]) =>
      resolveResourceMethodNames(value as object, `${path}.${name}`),
    );
  return [...methodNames, ...nestedMethodNames];
}

function resolveTemplatePattern(template: string): RegExp {
  return new RegExp(`^${template.replace(/\{\w+\}/g, '[^/]+')}$`);
}
