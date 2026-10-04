import { readFileSync } from 'node:fs';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from './client';
import { HttpClient } from './http-client';
import { resolveSentRequest, stubFetch } from './test-helpers';

interface OpenApiOperation {
  parameters?: { in: string; name: string }[];
  requestBody?: { content: Record<string, unknown> };
}

interface OpenApiDocument {
  paths: Record<string, Record<string, OpenApiOperation>>;
}

const APP_ID = '7c0f3a52-1d8e-4b6a-9f21-5e3c8a0d4b17';
const BASE_BUNDLE_ID = '8e2d6b1f-5a47-4c93-b0e8-7f1a3d5c9e20';
const BINARY_ID = '3f6a9c2e-7b14-4d58-9e03-b2c8d6f1a475';
const BUNDLE_ID = '2a9e6c14-8b3f-4d70-a5e2-91c7f0b3d864';
const CHANNEL_ID = 'e41b7d09-3c6a-4f85-b2d1-6a8f0c9e3b52';
const DEVICE_ID = '6b1e9d37-2f5c-4a80-9c46-d8e3a1f7b259';
const FILE = { path: 'index.html', sha256: 'a'.repeat(64), sizeBytes: 5 };
const HTTP_METHODS = ['delete', 'get', 'patch', 'post', 'put'];
const INVITATION_ID = '9d3c5e81-6f2a-4b07-8c14-3e7a1f9b0d26';
const MEMBER_ID = '5b8a2f47-0e9c-4d31-a6b8-2c4f7e1d9a03';
const ORGANIZATION_ID = 'c6e0b3a8-4d1f-4a92-b7e5-8f3d2c0a6b19';
const RELEASE_ID = '0f7d4c2b-9a6e-4e18-83b5-d1c9a7f2e604';
const SHA256 = 'a'.repeat(64);
const SIGNING_KEY_ID = '1c4f8a6d-3e92-4b57-a0d8-5f2b7c9e1a34';
const UPLOAD_ID = 'upload';

/**
 * One call per resource method with every option it can send, so a path, method,
 * query parameter, body or content type the document lacks fails here.
 */
const CALLS: Record<string, (hotCodePush: HotCodePush) => Promise<unknown>> = {
  'apps.binaries.count': hotCodePush =>
    hotCodePush.apps.binaries.count({
      appId: APP_ID,
      fingerprint: `fp1:${SHA256}`,
      platform: 'ios',
    }),
  'apps.binaries.create': hotCodePush =>
    hotCodePush.apps.binaries.create({
      appId: APP_ID,
      build: '42',
      files: [FILE],
      fingerprint: `fp1:${SHA256}`,
      force: true,
      idempotencyKey: 'key',
      platform: 'android',
      version: '1.0.0',
    }),
  'apps.binaries.get': hotCodePush =>
    hotCodePush.apps.binaries.get({
      appId: APP_ID,
      binaryId: BINARY_ID,
      relations: ['bundle'],
    }),
  'apps.binaries.list': hotCodePush =>
    hotCodePush.apps.binaries.list({
      appId: APP_ID,
      fingerprint: `fp1:${SHA256}`,
      limit: 10,
      offset: 10,
      platform: 'ios',
      relations: ['bundle'],
    }),
  'apps.bundles.complete': hotCodePush =>
    hotCodePush.apps.bundles.complete({ appId: APP_ID, bundleId: BUNDLE_ID }),
  'apps.bundles.count': hotCodePush =>
    hotCodePush.apps.bundles.count({
      appId: APP_ID,
      fingerprint: `fp1:${SHA256}`,
      isInUse: 'true',
      platform: 'ios',
      state: 'ready',
      type: 'uploaded',
      version: '1.0.0',
    }),
  'apps.bundles.create': hotCodePush =>
    hotCodePush.apps.bundles.create({
      appId: APP_ID,
      files: [FILE],
      gitSha: 'b'.repeat(40),
      idempotencyKey: 'key',
      platforms: ['android'],
      version: '1.0.0',
    }),
  'apps.bundles.delete': hotCodePush =>
    hotCodePush.apps.bundles.delete({ appId: APP_ID, bundleId: BUNDLE_ID }),
  'apps.bundles.deltas.upload': hotCodePush =>
    hotCodePush.apps.bundles.deltas.upload({
      appId: APP_ID,
      baseBundleId: BASE_BUNDLE_ID,
      body: new Blob(['delta']),
      bundleId: BUNDLE_ID,
    }),
  'apps.bundles.deltas.uploads.complete': hotCodePush =>
    hotCodePush.apps.bundles.deltas.uploads.complete({
      appId: APP_ID,
      baseBundleId: BASE_BUNDLE_ID,
      bundleId: BUNDLE_ID,
      parts: [{ etag: 'etag', partNumber: 1 }],
      uploadId: UPLOAD_ID,
    }),
  'apps.bundles.deltas.uploads.create': hotCodePush =>
    hotCodePush.apps.bundles.deltas.uploads.create({
      appId: APP_ID,
      baseBundleId: BASE_BUNDLE_ID,
      bundleId: BUNDLE_ID,
    }),
  'apps.bundles.deltas.uploads.delete': hotCodePush =>
    hotCodePush.apps.bundles.deltas.uploads.delete({
      appId: APP_ID,
      baseBundleId: BASE_BUNDLE_ID,
      bundleId: BUNDLE_ID,
      uploadId: UPLOAD_ID,
    }),
  'apps.bundles.deltas.uploads.parts.upload': hotCodePush =>
    hotCodePush.apps.bundles.deltas.uploads.parts.upload({
      appId: APP_ID,
      baseBundleId: BASE_BUNDLE_ID,
      body: new Blob(['part']),
      bundleId: BUNDLE_ID,
      partNumber: 1,
      uploadId: UPLOAD_ID,
    }),
  'apps.bundles.expoManifest.upload': hotCodePush =>
    hotCodePush.apps.bundles.expoManifest.upload({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      manifest: '{}',
      platform: 'ios',
      signature: { keyId: 'key', value: 'rsa-v1_5-sha256:c2ln' },
    }),
  'apps.bundles.files.count': hotCodePush =>
    hotCodePush.apps.bundles.files.count({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
    }),
  'apps.bundles.files.list': hotCodePush =>
    hotCodePush.apps.bundles.files.list({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      limit: 10,
      offset: 10,
    }),
  'apps.bundles.get': hotCodePush =>
    hotCodePush.apps.bundles.get({ appId: APP_ID, bundleId: BUNDLE_ID }),
  'apps.bundles.list': hotCodePush =>
    hotCodePush.apps.bundles.list({
      appId: APP_ID,
      fingerprint: `fp1:${SHA256}`,
      isInUse: 'true',
      limit: 10,
      offset: 10,
      platform: 'ios',
      state: 'ready',
      type: 'uploaded',
      version: '1.0.0',
    }),
  'apps.bundles.pack.upload': hotCodePush =>
    hotCodePush.apps.bundles.pack.upload({
      appId: APP_ID,
      body: new Blob(['pack']).stream(),
      bundleId: BUNDLE_ID,
      contentLength: 4,
    }),
  'apps.bundles.pack.uploads.complete': hotCodePush =>
    hotCodePush.apps.bundles.pack.uploads.complete({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      parts: [{ etag: 'etag', partNumber: 1 }],
      uploadId: UPLOAD_ID,
    }),
  'apps.bundles.pack.uploads.create': hotCodePush =>
    hotCodePush.apps.bundles.pack.uploads.create({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
    }),
  'apps.bundles.pack.uploads.delete': hotCodePush =>
    hotCodePush.apps.bundles.pack.uploads.delete({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      uploadId: UPLOAD_ID,
    }),
  'apps.bundles.pack.uploads.parts.upload': hotCodePush =>
    hotCodePush.apps.bundles.pack.uploads.parts.upload({
      appId: APP_ID,
      body: new Blob(['part']),
      bundleId: BUNDLE_ID,
      partNumber: 1,
      uploadId: UPLOAD_ID,
    }),
  'apps.channels.audience.get': hotCodePush =>
    hotCodePush.apps.channels.audience.get({
      appId: APP_ID,
      attribute: ['tier=gold'],
      binary: ['>=2.0.0'],
      channelId: CHANNEL_ID,
      device: [DEVICE_ID],
      fingerprint: [`fp1:${SHA256}`],
      os: ['>=17'],
      rollout: 10,
      runtime: ['1.0.0'],
    }),
  'apps.channels.count': hotCodePush =>
    hotCodePush.apps.channels.count({ appId: APP_ID }),
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
  'apps.channels.qr.get': hotCodePush =>
    hotCodePush.apps.channels.qr.get({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      format: 'png',
    }),
  'apps.channels.releases.count': hotCodePush =>
    hotCodePush.apps.channels.releases.count({
      appId: APP_ID,
      channelId: CHANNEL_ID,
    }),
  'apps.channels.releases.create': hotCodePush =>
    hotCodePush.apps.channels.releases.create({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      channelId: CHANNEL_ID,
      conditions: [{ range: '>=2.0.0', type: 'binary' }],
      failureAction: 'pause',
      failureMinSample: 20,
      failureThresholdPercent: 10,
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
  'apps.channels.releases.revoke': hotCodePush =>
    hotCodePush.apps.channels.releases.revoke({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      fromNumber: 3,
    }),
  'apps.channels.resume': hotCodePush =>
    hotCodePush.apps.channels.resume({ appId: APP_ID, channelId: CHANNEL_ID }),
  'apps.channels.rollbacks.create': hotCodePush =>
    hotCodePush.apps.channels.rollbacks.create({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      idempotencyKey: 'key',
      isMandatory: false,
      toReleaseId: RELEASE_ID,
    }),
  'apps.channels.update': hotCodePush =>
    hotCodePush.apps.channels.update({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      name: 'beta',
    }),
  'apps.delete': hotCodePush => hotCodePush.apps.delete({ appId: APP_ID }),
  'apps.deploymentKeys.count': hotCodePush =>
    hotCodePush.apps.deploymentKeys.count({ appId: APP_ID }),
  'apps.deploymentKeys.create': hotCodePush =>
    hotCodePush.apps.deploymentKeys.create({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      idempotencyKey: 'key',
      platform: 'ios',
    }),
  'apps.deploymentKeys.delete': hotCodePush =>
    hotCodePush.apps.deploymentKeys.delete({ appId: APP_ID, key: 'key' }),
  'apps.deploymentKeys.list': hotCodePush =>
    hotCodePush.apps.deploymentKeys.list({
      appId: APP_ID,
      limit: 10,
      offset: 10,
    }),
  'apps.devices.count': hotCodePush =>
    hotCodePush.apps.devices.count({
      appId: APP_ID,
      attribute: 'tier=gold',
      binaryBuild: '42',
      binaryVersion: '1.0.0',
      channelId: CHANNEL_ID,
      fingerprint: `fp1:${SHA256}`,
      lastSeenSince: '2026-01-01T00:00:00.000Z',
      lastSeenUntil: '2026-02-01T00:00:00.000Z',
      platform: 'ios',
      sdkVersion: '1.0.0',
    }),
  'apps.devices.delete': hotCodePush =>
    hotCodePush.apps.devices.delete({ appId: APP_ID, deviceId: DEVICE_ID }),
  'apps.devices.get': hotCodePush =>
    hotCodePush.apps.devices.get({
      appId: APP_ID,
      deviceId: DEVICE_ID,
      relations: ['channel'],
    }),
  'apps.devices.list': hotCodePush =>
    hotCodePush.apps.devices.list({
      appId: APP_ID,
      attribute: 'tier=gold',
      binaryBuild: '42',
      binaryVersion: '1.0.0',
      channelId: CHANNEL_ID,
      fingerprint: `fp1:${SHA256}`,
      lastSeenSince: '2026-01-01T00:00:00.000Z',
      lastSeenUntil: '2026-02-01T00:00:00.000Z',
      limit: 10,
      offset: 10,
      platform: 'ios',
      relations: ['channel'],
      sdkVersion: '1.0.0',
    }),
  'apps.files.upload': hotCodePush =>
    hotCodePush.apps.files.upload({
      appId: APP_ID,
      body: new Blob(['gzip']),
      sha256: SHA256,
    }),
  'apps.files.uploads.complete': hotCodePush =>
    hotCodePush.apps.files.uploads.complete({
      appId: APP_ID,
      parts: [{ etag: 'etag', partNumber: 1 }],
      sha256: SHA256,
      uploadId: UPLOAD_ID,
    }),
  'apps.files.uploads.create': hotCodePush =>
    hotCodePush.apps.files.uploads.create({
      appId: APP_ID,
      sha256: SHA256,
    }),
  'apps.files.uploads.delete': hotCodePush =>
    hotCodePush.apps.files.uploads.delete({
      appId: APP_ID,
      sha256: SHA256,
      uploadId: UPLOAD_ID,
    }),
  'apps.files.uploads.parts.upload': hotCodePush =>
    hotCodePush.apps.files.uploads.parts.upload({
      appId: APP_ID,
      body: new Blob(['part']),
      partNumber: 1,
      sha256: SHA256,
      uploadId: UPLOAD_ID,
    }),
  'apps.get': hotCodePush => hotCodePush.apps.get({ appId: APP_ID }),
  'apps.releases.audience.get': hotCodePush =>
    hotCodePush.apps.releases.audience.get({
      appId: APP_ID,
      releaseId: RELEASE_ID,
    }),
  'apps.releases.count': hotCodePush =>
    hotCodePush.apps.releases.count({
      appId: APP_ID,
      bundleId: BUNDLE_ID,
      channelId: CHANNEL_ID,
      state: 'active',
    }),
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
      relations: ['channel'],
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
  'apps.signingKeys.count': hotCodePush =>
    hotCodePush.apps.signingKeys.count({ appId: APP_ID }),
  'apps.signingKeys.create': hotCodePush =>
    hotCodePush.apps.signingKeys.create({
      appId: APP_ID,
      publicKey: 'ed25519:key',
    }),
  'apps.signingKeys.delete': hotCodePush =>
    hotCodePush.apps.signingKeys.delete({
      appId: APP_ID,
      signingKeyId: SIGNING_KEY_ID,
    }),
  'apps.signingKeys.list': hotCodePush =>
    hotCodePush.apps.signingKeys.list({ appId: APP_ID, limit: 10, offset: 10 }),
  'apps.statistics.fleet.get': hotCodePush =>
    hotCodePush.apps.statistics.fleet.get({
      appId: APP_ID,
      channelId: CHANNEL_ID,
    }),
  'apps.statistics.updates.get': hotCodePush =>
    hotCodePush.apps.statistics.updates.get({
      appId: APP_ID,
      channelId: CHANNEL_ID,
      periodSince: '2026-09-01',
      periodUntil: '2026-09-30',
    }),
  'apps.statistics.usage.get': hotCodePush =>
    hotCodePush.apps.statistics.usage.get({
      appId: APP_ID,
      periodSince: '2026-09-01',
      periodUntil: '2026-09-30',
    }),
  'apps.transfer': hotCodePush =>
    hotCodePush.apps.transfer({
      appId: APP_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'apps.update': hotCodePush =>
    hotCodePush.apps.update({ appId: APP_ID, framework: 'expo', name: 'Demo' }),
  'invitations.accept': hotCodePush =>
    hotCodePush.invitations.accept({
      invitationId: INVITATION_ID,
      token: 'token',
    }),
  'invitations.count': hotCodePush => hotCodePush.invitations.count(),
  'invitations.list': hotCodePush => hotCodePush.invitations.list(),
  'organizations.apps.count': hotCodePush =>
    hotCodePush.organizations.apps.count({ organizationId: ORGANIZATION_ID }),
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
  'organizations.count': hotCodePush => hotCodePush.organizations.count(),
  'organizations.create': hotCodePush =>
    hotCodePush.organizations.create({ idempotencyKey: 'key', name: 'Acme' }),
  'organizations.delete': hotCodePush =>
    hotCodePush.organizations.delete({ organizationId: ORGANIZATION_ID }),
  'organizations.get': hotCodePush =>
    hotCodePush.organizations.get({ organizationId: ORGANIZATION_ID }),
  'organizations.invitations.count': hotCodePush =>
    hotCodePush.organizations.invitations.count({
      organizationId: ORGANIZATION_ID,
      status: 'pending',
    }),
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
      status: 'pending',
    }),
  'organizations.list': hotCodePush =>
    hotCodePush.organizations.list({ limit: 10, offset: 10 }),
  'organizations.members.count': hotCodePush =>
    hotCodePush.organizations.members.count({
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.members.delete': hotCodePush =>
    hotCodePush.organizations.members.delete({
      memberId: MEMBER_ID,
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.members.get': hotCodePush =>
    hotCodePush.organizations.members.get({
      memberId: MEMBER_ID,
      organizationId: ORGANIZATION_ID,
      relations: ['user'],
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
  'organizations.ssoProvider.delete': hotCodePush =>
    hotCodePush.organizations.ssoProvider.delete({
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.ssoProvider.get': hotCodePush =>
    hotCodePush.organizations.ssoProvider.get({
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.ssoProvider.put': hotCodePush =>
    hotCodePush.organizations.ssoProvider.put({
      domain: 'example.com',
      oidc: {
        clientId: 'client',
        clientSecret: 'secret',
        discoveryEndpoint:
          'https://idp.example.com/.well-known/openid-configuration',
        issuer: 'https://idp.example.com',
        scopes: ['openid'],
      },
      organizationId: ORGANIZATION_ID,
    }),
  'organizations.ssoProvider.verifications.create': hotCodePush =>
    hotCodePush.organizations.ssoProvider.verifications.create({
      organizationId: ORGANIZATION_ID,
    }),
  'users.delete': hotCodePush => hotCodePush.users.delete({ userId: 'me' }),
  'users.get': hotCodePush => hotCodePush.users.get({ userId: 'me' }),
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

  test('should hold a call for every operation it documents', async () => {
    const fetchMock = stubFetch();

    for (const callResourceMethod of Object.values(CALLS)) {
      await callResourceMethod(new HotCodePush());
    }

    const calledOperationNames = fetchMock.mock.calls.map(([input, init]) =>
      resolveOperationName(init?.method ?? 'GET', new URL(String(input))),
    );
    expect([...new Set(calledOperationNames)].sort()).toEqual(
      resolveDocumentedOperationNames().sort(),
    );
  });

  test.each(Object.entries(CALLS))(
    'should document the path, method, query, body and content type %s sends',
    async (_name, callResourceMethod) => {
      const fetchMock = stubFetch();

      await callResourceMethod(new HotCodePush());

      const sentRequest = resolveSentRequest(fetchMock);
      const url = new URL(sentRequest.url);
      const operation = resolveOperation(sentRequest.method, url.pathname);
      const documentedQueryNames = (operation?.parameters ?? [])
        .filter(parameter => parameter.in === 'query')
        .map(parameter => parameter.name);
      const documentedContentTypes = Object.keys(
        operation?.requestBody?.content ?? {},
      );
      const sentContentType = sentRequest.headers['Content-Type'];
      expect(
        operation,
        `${sentRequest.method} ${url.pathname} is not in openapi.json`,
      ).toBeDefined();
      expect(documentedQueryNames).toEqual(
        expect.arrayContaining([...url.searchParams.keys()]),
      );
      expect(sentRequest.body !== undefined).toBe(
        documentedContentTypes.length > 0,
      );
      expect(documentedContentTypes).toEqual(
        expect.arrayContaining(
          sentContentType === undefined ? [] : [sentContentType],
        ),
      );
    },
  );
});

function resolveDocumentedOperationNames(): string[] {
  return Object.entries(openApiDocument.paths).flatMap(([template, pathItem]) =>
    Object.keys(pathItem)
      .filter(method => HTTP_METHODS.includes(method))
      .map(method => `${method.toUpperCase()} ${template}`),
  );
}

function resolveOperation(
  method: string,
  pathname: string,
): OpenApiOperation | undefined {
  const template = resolvePathTemplate(pathname);
  return template === undefined
    ? undefined
    : openApiDocument.paths[template]?.[method.toLowerCase()];
}

function resolveOperationName(method: string, url: URL): string {
  return `${method} ${resolvePathTemplate(url.pathname) ?? url.pathname}`;
}

function resolvePathTemplate(pathname: string): string | undefined {
  return Object.keys(openApiDocument.paths).find(template =>
    resolveTemplatePattern(template).test(pathname),
  );
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
