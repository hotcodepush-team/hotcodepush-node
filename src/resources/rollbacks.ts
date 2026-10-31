import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
} from '../types';
import type { ReleaseRow } from './releases';

export type CreateRollbackOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/rollbacks',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels/{channelId}/rollbacks', 'post'> &
  IdempotencyOptions;

export class RollbacksResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Rolls the channel back to its previous bundle, or to the bundle of `toReleaseId`.
   * A rollback is a new release.
   */
  public async create(options: CreateRollbackOptions): Promise<ReleaseRow> {
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
