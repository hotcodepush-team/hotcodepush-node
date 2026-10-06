import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { JsonRequestBody, PathParameters } from '../types';

export type CreateUserPasswordOptions = PathParameters<
  '/v1/users/{userId}/password',
  'post'
> &
  JsonRequestBody<'/v1/users/{userId}/password', 'post'>;

export class UserPasswordResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Sets the first password of an account that signed up through GitHub, Google or SSO, and ends its other sessions.
   * An account with a password answers `E_PASSWORD_ALREADY_SET`, as a repeat would, so the call is never retried.
   */
  public async create(options: CreateUserPasswordOptions): Promise<void> {
    const { userId, ...body } = options;
    await this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/users/{userId}/password', { userId }),
    });
  }
}
