import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountSigningKeysOptions = PathParameters<
  '/v1/apps/{appId}/signing-keys/count',
  'get'
>;

export type CreateSigningKeyOptions = PathParameters<
  '/v1/apps/{appId}/signing-keys',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/signing-keys', 'post'>;

export type DeleteSigningKeyOptions = PathParameters<
  '/v1/apps/{appId}/signing-keys/{signingKeyId}',
  'delete'
>;

export type ListSigningKeysOptions = PathParameters<
  '/v1/apps/{appId}/signing-keys',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/signing-keys', 'get'>;

/**
 * A public key the app's bundles are verified against.
 */
export type SigningKey = JsonResponseBody<
  '/v1/apps/{appId}/signing-keys',
  'post',
  201
>;

export class SigningKeysResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the app's signing keys.
   */
  public async count(options: CountSigningKeysOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/signing-keys/count', options),
    });
  }

  /**
   * Registers a public key; from then on the app releases only signed bundles.
   * A repeat registers the key a second time, so the call is never retried.
   */
  public async create(options: CreateSigningKeyOptions): Promise<SigningKey> {
    const { appId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      method: 'POST',
      path: resolvePath('/v1/apps/{appId}/signing-keys', { appId }),
    });
  }

  public async delete(options: DeleteSigningKeyOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath(
        '/v1/apps/{appId}/signing-keys/{signingKeyId}',
        options,
      ),
    });
  }

  /**
   * The app's signing keys, newest first.
   */
  public async list(options: ListSigningKeysOptions): Promise<SigningKey[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/signing-keys', { appId }),
      query,
    });
  }
}
