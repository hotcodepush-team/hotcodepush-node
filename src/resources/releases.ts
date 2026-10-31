import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import { ReleaseAudienceResource } from './release-audience';

export type CountReleasesOptions = PathParameters<
  '/v1/apps/{appId}/releases/count',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/releases/count', 'get'>;

export type GetReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/releases/{releaseId}', 'get'>;

export type ListReleasesOptions = PathParameters<
  '/v1/apps/{appId}/releases',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/releases', 'get'>;

export type PauseReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}/pause',
  'post'
>;

export type Release = JsonResponseBody<
  '/v1/apps/{appId}/releases/{releaseId}',
  'get',
  200
>;

/**
 * A release without its relations, as every write answers it.
 */
export type ReleaseRow = JsonResponseBody<
  '/v1/apps/{appId}/releases/{releaseId}',
  'patch',
  200
>;

export type ResumeReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}/resume',
  'post'
>;

export type RevokeReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}/revoke',
  'post'
>;

export type UpdateReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}',
  'patch'
> &
  JsonRequestBody<'/v1/apps/{appId}/releases/{releaseId}', 'patch'>;

export class ReleasesResource {
  public readonly audience: ReleaseAudienceResource;

  constructor(private readonly httpClient: HttpClient) {
    this.audience = new ReleaseAudienceResource(httpClient);
  }

  /**
   * Counts the releases of the app that match the filters.
   * `number` is valid only beside `channelId`, since release numbers count per channel.
   */
  public async count(options: CountReleasesOptions): Promise<Count> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/releases/count', { appId }),
      query,
    });
  }

  /**
   * Gets a release with its status: when it went live in the index and when the purge completed.
   */
  public async get(options: GetReleaseOptions): Promise<Release> {
    const { appId, releaseId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/releases/{releaseId}', {
        appId,
        releaseId,
      }),
      query,
    });
  }

  /**
   * Lists every release of the app, newest first.
   * `channelId` selects the release log of one channel, and `number` beside it one release of that log.
   */
  public async list(options: ListReleasesOptions): Promise<Release[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/releases', { appId }),
      query,
    });
  }

  /**
   * Pauses a release: it is no longer offered, and devices on it keep it.
   * Pausing a paused release answers it unchanged, so the client retries the call.
   */
  public async pause(options: PauseReleaseOptions): Promise<ReleaseRow> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/releases/{releaseId}/pause', options),
    });
  }

  /**
   * Resumes a paused release, so it is offered again.
   * Resuming an active release answers it unchanged, so the client retries the call.
   */
  public async resume(options: ResumeReleaseOptions): Promise<ReleaseRow> {
    return this.httpClient.fetchJson({
      isRetryable: true,
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/releases/{releaseId}/resume',
        options,
      ),
    });
  }

  /**
   * Revokes a release for good.
   * Devices on it move to the newest eligible older release or to the embedded bundle.
   * A repeat answers `release_revoked`, so the client never retries the call.
   */
  public async revoke(options: RevokeReleaseOptions): Promise<ReleaseRow> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/releases/{releaseId}/revoke',
        options,
      ),
    });
  }

  /**
   * Changes the rollout percentage (up or down), the progression schedule, the mandatory flag or the notes.
   * Setting the progression schedule to null stops it.
   */
  public async update(options: UpdateReleaseOptions): Promise<ReleaseRow> {
    const { appId, releaseId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'PATCH',
      path: resolvePath('/v1/apps/{appId}/releases/{releaseId}', {
        appId,
        releaseId,
      }),
    });
  }
}
