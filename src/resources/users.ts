import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';
import { UserPasswordResource } from './user-password';
import { UserSessionsResource } from './user-sessions';
import { UserTokensResource } from './user-tokens';

export type DeleteUserOptions = PathParameters<'/v1/users/{userId}', 'delete'> &
  JsonRequestBody<'/v1/users/{userId}', 'delete'>;

export type GetUserOptions = PathParameters<'/v1/users/{userId}', 'get'> &
  QueryParameters<'/v1/users/{userId}', 'get'>;

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
   * Soft-deletes the account of the caller. It is gone at once and hard-deleted after seven days.
   * `userId` takes `me`. `password` is the account password; a wrong one answers `forbidden`.
   * An account without a password also answers `forbidden` and must set one first through `users.password.create`.
   * An API token answers `forbidden`; sign in with a session.
   */
  public async delete(options: DeleteUserOptions): Promise<void> {
    const { userId, ...body } = options;
    await this.httpClient.fetchJson({
      body,
      method: 'DELETE',
      path: resolvePath('/v1/users/{userId}', { userId }),
    });
  }

  /**
   * Gets the caller behind the token.
   * `userId` takes `me`; another user answers `forbidden`.
   * `relations` embeds `accounts` (the sign-in identities) and `members` (the member rows of live organizations). With `members.organization`, each member row embeds its organization.
   */
  public async get(options: GetUserOptions): Promise<User> {
    const { userId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/users/{userId}', { userId }),
      query,
    });
  }
}
