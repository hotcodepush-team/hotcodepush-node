import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
} from '../types';
import type { Release } from './releases';

export type CreateRollbackOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/rollbacks',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels/{channelId}/rollbacks', 'post'> &
  IdempotencyOptions;

export class RollbacksResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Releases the channel's previous bundle again, or the one of `toReleaseId`; a rollback is a new release.
   */
  public async create(options: CreateRollbackOptions): Promise<Release> {
    const { appId, channelId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/rollbacks', {
        appId,
        channelId,
      }),
    });
  }
}
