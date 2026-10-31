import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
} from '../types';
import type { ReleaseRow } from './releases';

export type CreateReleaseOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels/{channelId}/releases', 'post'> &
  IdempotencyOptions;

export type RevokeChannelReleasesOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases/revoke',
  'post'
> &
  JsonRequestBody<
    '/v1/apps/{appId}/channels/{channelId}/releases/revoke',
    'post'
  >;

export class ChannelReleasesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Releases a ready bundle, or what another channel serves, in this channel.
   * The release gets the next number of the channel.
   */
  public async create(options: CreateReleaseOptions): Promise<ReleaseRow> {
    const { appId, channelId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/releases', {
        appId,
        channelId,
      }),
    });
  }

  /**
   * Revokes several releases of the channel at once: those in `releaseIds`, or every release numbered at or above `fromNumber`.
   * Revoking a revoked release does nothing, so the client retries the call.
   */
  public async revoke(
    options: RevokeChannelReleasesOptions,
  ): Promise<ReleaseRow[]> {
    const { appId, channelId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/channels/{channelId}/releases/revoke',
        { appId, channelId },
      ),
    });
  }
}
