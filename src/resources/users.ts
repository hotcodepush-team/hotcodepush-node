import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters } from '../types';

export type DeleteUserOptions = PathParameters<'/v1/users/{userId}', 'delete'>;

export class UsersResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Soft-deletes the caller's account: gone at once, hard-deleted after seven days.
   * `userId` takes `me` for the caller.
   */
  public async delete(options: DeleteUserOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/users/{userId}', options),
    });
  }
}
