import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type GetReleaseOptions = PathParameters<
  '/v1/apps/{appId}/releases/{releaseId}',
  'get'
> & {
  /**
   * The linked rows to embed.
   */
  relations?: readonly ReleaseRelation[];
};

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
 * The document types `relations` as a free string; the allow-list is the API's.
 */
export type ReleaseRelation = 'bundle' | 'channel' | 'counters';

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
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * A release with its status: when it went live in the index and when the purge completed.
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
   * Every release of the app, newest first.
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
   * Stops offering a release; devices on it keep it.
   */
  public async pause(options: PauseReleaseOptions): Promise<Release> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/releases/{releaseId}/pause', options),
    });
  }

  /**
   * Offers a paused release again.
   */
  public async resume(options: ResumeReleaseOptions): Promise<Release> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/releases/{releaseId}/resume',
        options,
      ),
    });
  }

  /**
   * Revokes a release for good: devices on it move to the newest eligible older release or the embedded bundle.
   */
  public async revoke(options: RevokeReleaseOptions): Promise<Release> {
    return this.httpClient.fetchJson({
      method: 'POST',
      path: resolvePath(
        '/v1/apps/{appId}/releases/{releaseId}/revoke',
        options,
      ),
    });
  }

  /**
   * Changes the rollout percentage in both directions, the mandatory flag or the notes.
   */
  public async update(options: UpdateReleaseOptions): Promise<Release> {
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
