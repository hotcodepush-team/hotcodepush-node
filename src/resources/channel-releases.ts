import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  PathParameters,
  QueryParameters,
} from '../types';
import type { Release } from './releases';

export type CountChannelReleasesOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/releases/count',
  'get'
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
   * Releases a ready bundle in the channel, numbered next in the channel.
   */
  public async create(options: CreateReleaseOptions): Promise<Release> {
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
}
