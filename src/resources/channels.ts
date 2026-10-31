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
import { ChannelQrResource } from './channel-qr';
import { ChannelReleasesResource } from './channel-releases';
import { RollbacksResource } from './rollbacks';

export type Channel = JsonResponseBody<
  '/v1/apps/{appId}/channels',
  'post',
  201
>;

export type CountChannelsOptions = PathParameters<
  '/v1/apps/{appId}/channels/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels/count', 'get'>;

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

export type DeleteManyChannelsOptions = PathParameters<
  '/v1/apps/{appId}/channels',
  'delete'
> &
  QueryParameters<'/v1/apps/{appId}/channels', 'delete'>;

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
  public readonly qr: ChannelQrResource;
  public readonly releases: ChannelReleasesResource;
  public readonly rollbacks: RollbacksResource;

  constructor(private readonly httpClient: HttpClient) {
    this.audience = new ChannelAudienceResource(httpClient);
    this.qr = new ChannelQrResource(httpClient);
    this.releases = new ChannelReleasesResource(httpClient);
    this.rollbacks = new RollbacksResource(httpClient);
  }

  /**
   * Counts the channels of the app that match the filters.
   */
  public async count(options: CountChannelsOptions): Promise<Count> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/count', { appId }),
      query,
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
   * Deletes a channel at once. The default channel of the app is refused.
   */
  public async delete(options: DeleteChannelOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}', options),
    });
  }

  /**
   * Deletes the channels of the app named by `ids`, one to 100. An id of another app is skipped.
   * The default channel, or a protected channel when the caller is a Member, refuses the whole set.
   */
  public async deleteMany(options: DeleteManyChannelsOptions): Promise<void> {
    const { appId, ...query } = options;
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/channels', { appId }),
      query,
    });
  }

  /**
   * Gets a channel.
   * To count its devices, call `apps.statistics.fleet.get` with its `channelId`.
   */
  public async get(options: GetChannelOptions): Promise<Channel> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}', options),
    });
  }

  /**
   * Lists the channels of the app, newest first.
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
   * Pausing a paused channel answers it unchanged, so the client retries the call.
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
   * Resuming a running channel answers it unchanged, so the client retries the call.
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
