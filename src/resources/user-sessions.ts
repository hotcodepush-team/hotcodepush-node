import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, QueryParameters } from '../types';

export type DeleteManySessionsOptions = PathParameters<
  '/v1/users/{userId}/sessions',
  'delete'
> &
  QueryParameters<'/v1/users/{userId}/sessions', 'delete'>;

export class UserSessionsResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Ends the caller's sessions named by `ids`, one to 100, the current one included; an id that is not the caller's is skipped.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async deleteMany(options: DeleteManySessionsOptions): Promise<void> {
    const { userId, ...query } = options;
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/users/{userId}/sessions', { userId }),
      query,
    });
  }
}
