import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonResponseBody, PathParameters } from '../types';
import { UserPasswordResource } from './user-password';
import { UserSessionsResource } from './user-sessions';
import { UserTokensResource } from './user-tokens';

export type DeleteUserOptions = PathParameters<'/v1/users/{userId}', 'delete'>;

export type GetUserOptions = PathParameters<'/v1/users/{userId}', 'get'>;

export type User = JsonResponseBody<'/v1/users/{userId}', 'get', 200>;

export class UsersResource {
  public readonly password: UserPasswordResource;
  public readonly sessions: UserSessionsResource;
  public readonly tokens: UserTokensResource;

  constructor(private readonly httpClient: HttpClient) {
    this.password = new UserPasswordResource(httpClient);
    this.sessions = new UserSessionsResource(httpClient);
    this.tokens = new UserTokensResource(httpClient);
  }

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

  /**
   * The caller behind the token and whether it is a session or an API token.
   * `userId` takes `me` for the caller; another user answers `E_FORBIDDEN`.
   */
  public async get(options: GetUserOptions): Promise<User> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/users/{userId}', options),
    });
  }
}
