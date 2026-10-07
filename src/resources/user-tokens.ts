import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, QueryParameters } from '../types';

export type DeleteManyTokensOptions = PathParameters<
  '/v1/users/{userId}/tokens',
  'delete'
> &
  QueryParameters<'/v1/users/{userId}/tokens', 'delete'>;

export class UserTokensResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Deletes the caller's API tokens named by `ids`, one to 100; an id that is not the caller's is skipped.
   * An API token answers `E_FORBIDDEN`; sign in with a session.
   */
  public async deleteMany(options: DeleteManyTokensOptions): Promise<void> {
    const { userId, ...query } = options;
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/users/{userId}/tokens', { userId }),
      query,
    });
  }
}
