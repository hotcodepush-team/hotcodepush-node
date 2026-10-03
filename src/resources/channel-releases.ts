import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { Release } from './releases';

export type CountChannelReleasesOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases/count',
  'get'
>;

/**
 * A release as its creation answers it, with the warnings of what it will likely not do.
 */
export type CreatedRelease = JsonResponseBody<
  '/v1/apps/{appId}/channels/{channelId}/releases',
  'post',
  201
>;

export type CreateReleaseOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels/{channelId}/releases', 'post'> &
  IdempotencyOptions;

export type ListChannelReleasesOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels/{channelId}/releases', 'get'>;

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
   * The number of releases in the channel's log.
   */
  public async count(options: CountChannelReleasesOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath(
        '/v1/apps/{appId}/channels/{channelId}/releases/count',
        options,
      ),
    });
  }

  /**
   * Releases a ready bundle, or what another channel serves, in the channel, numbered next in the channel.
   */
  public async create(options: CreateReleaseOptions): Promise<CreatedRelease> {
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
   * The channel's release log, newest first.
   */
  public async list(options: ListChannelReleasesOptions): Promise<Release[]> {
    const { appId, channelId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/releases', {
        appId,
        channelId,
      }),
      query,
    });
  }

  /**
   * Revokes several releases of the channel at once, the ones of `releaseIds` or every one numbered at or above `fromNumber`.
   * A release already revoked is a no-op, so the call is retried.
   */
  public async revoke(
    options: RevokeChannelReleasesOptions,
  ): Promise<Release[]> {
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
