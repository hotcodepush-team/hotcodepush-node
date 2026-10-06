import { afterEach, describe, expect, test, vi } from 'vitest';

import { HotCodePush } from '../client';
import { resolveSentRequest, stubFetch } from '../test-helpers';

const AUDIT_LOGS_URL =
  'https://api.hotcodepush.com/v1/organizations/organization/audit-logs';
const AUDIT_LOG = { id: 'audit-log', type: 'channel.created' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuditLogsResource', () => {
  test('should count the rows of the audit log under the filters', async () => {
    const fetchMock = stubFetch(() => Response.json({ total: 3 }));

    const fetchedCount = await new HotCodePush().organizations.auditLogs.count({
      organizationId: 'organization',
      type: 'channel.*',
    });

    expect(fetchedCount).toEqual({ total: 3 });
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${AUDIT_LOGS_URL}/count?type=channel.*`,
    });
  });

  test('should download the audit log under the filters as csv', async () => {
    const fetchMock = stubFetch(
      () =>
        new Response('"id","type"\n', {
          headers: { 'Content-Type': 'text/csv; charset=utf-8' },
        }),
    );

    const downloadedCsv =
      await new HotCodePush().organizations.auditLogs.downloadCsv({
        organizationId: 'organization',
        type: 'channel.*',
      });

    expect(await downloadedCsv.text()).toBe('"id","type"\n');
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${AUDIT_LOGS_URL}?type=channel.*&format=csv`,
    });
  });

  test('should list the audit log with its users when the user relation is set', async () => {
    const fetchMock = stubFetch(() => Response.json([AUDIT_LOG]));

    const fetchedAuditLogs =
      await new HotCodePush().organizations.auditLogs.list({
        organizationId: 'organization',
        relations: ['user'],
        userId: 'user',
      });

    expect(fetchedAuditLogs).toEqual([AUDIT_LOG]);
    expect(resolveSentRequest(fetchMock)).toMatchObject({
      method: 'GET',
      url: `${AUDIT_LOGS_URL}?relations=user&userId=user`,
    });
  });
});
