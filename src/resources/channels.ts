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
import { ChannelAudienceResource } from './channel-audience';
import { ChannelIndexesResource } from './channel-indexes';
import { ChannelQrResource } from './channel-qr';
import { ChannelReleasesResource } from './channel-releases';
import { RollbacksResource } from './rollbacks';

export type Channel = JsonResponseBody<
  '/v1/apps/{appId}/channels',
  'post',
  201
>;

export type ChannelWithDeviceCounts = JsonResponseBody<
  '/v1/apps/{appId}/channels/{channelId}',
  'get',
  200
>;

export type CountChannelsOptions = PathParameters<
  '/v1/apps/{appId}/channels/count',
  'get'
>;

export type CreateChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels', 'post'> &
  IdempotencyOptions;

export type DeleteChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}',
  'delete'
>;

export type GetChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}',
  'get'
>;

export type ListChannelsOptions = PathParameters<
  '/v1/apps/{appId}/channels',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels', 'get'>;

export type PauseChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/pause',
  'post'
>;

export type ResumeChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/resume',
  'post'
>;

export type UpdateChannelOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}',
  'patch'
> &
  JsonRequestBody<'/v1/apps/{appId}/channels/{channelId}', 'patch'>;

export class ChannelsResource {
  public readonly audience: ChannelAudienceResource;
  public readonly indexes: ChannelIndexesResource;
  public readonly qr: ChannelQrResource;
  public readonly releases: ChannelReleasesResource;
  public readonly rollbacks: RollbacksResource;

  constructor(private readonly httpClient: HttpClient) {
    this.audience = new ChannelAudienceResource(httpClient);
    this.indexes = new ChannelIndexesResource(httpClient);
    this.qr = new ChannelQrResource(httpClient);
    this.releases = new ChannelReleasesResource(httpClient);
    this.rollbacks = new RollbacksResource(httpClient);
  }

  /**
   * The number of the app's channels.
   */
  public async count(options: CountChannelsOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/count', options),
    });
  }

  public async create(options: CreateChannelOptions): Promise<Channel> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/channels', { appId }),
    });
  }

  /**
   * Deletes a channel at once; the app's default channel is refused.
   */
  public async delete(options: DeleteChannelOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}', options),
    });
  }

  /**
   * A channel with the device counts of its page's header.
   */
  public async get(
    options: GetChannelOptions,
  ): Promise<ChannelWithDeviceCounts> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}', options),
    });
  }

  /**
   * The app's channels, newest first.
   */
  public async list(options: ListChannelsOptions): Promise<Channel[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels', { appId }),
      query,
    });
  }

  /**
   * Pauses a channel: it serves nothing new, and devices keep what they have.
   * Pausing a paused channel answers it unchanged, so the call is retried.
   */
  public async pause(options: PauseChannelOptions): Promise<Channel> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/pause', options),
    });
  }

  /**
   * Resumes a paused channel.
   * Resuming a running channel answers it unchanged, so the call is retried.
   */
  public async resume(options: ResumeChannelOptions): Promise<Channel> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/channels/{channelId}/resume',
        options,
      ),
    });
  }

  public async update(options: UpdateChannelOptions): Promise<Channel> {
    const { appId, channelId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}', {
        appId,
        channelId,
      }),
    });
  }
}
