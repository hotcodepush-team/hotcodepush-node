import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { App } from './apps';

export type CountAppsOptions = PathParameters<
  '/v1/organizations/{organizationId}/apps/count',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/apps/count', 'get'>;

export type CreateAppOptions = PathParameters<
  '/v1/organizations/{organizationId}/apps',
  'post'
> &
  JsonRequestBody<'/v1/organizations/{organizationId}/apps', 'post'> &
  IdempotencyOptions;

export type ListAppsOptions = PathParameters<
  '/v1/organizations/{organizationId}/apps',
  'get'
> &
  QueryParameters<'/v1/organizations/{organizationId}/apps', 'get'>;

export class OrganizationAppsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the organization's apps under the list's filters.
   */
  public async count(options: CountAppsOptions): Promise<Count> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/apps/count', {
        organizationId,
      }),
      query,
    });
  }

  /**
   * Creates an app with its default channel `production`.
   */
  public async create(options: CreateAppOptions): Promise<App> {
    const { idempotencyKey, organizationId, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/organizations/{organizationId}/apps', {
        organizationId,
      }),
    });
  }

  /**
   * The organization's apps, newest first.
   */
  public async list(options: ListAppsOptions): Promise<App[]> {
    const { organizationId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/organizations/{organizationId}/apps', {
        organizationId,
      }),
      query,
    });
  }
}
