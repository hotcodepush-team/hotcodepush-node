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
 * A public key that the bundles of the app are verified against.
 */
export type SigningKey = JsonResponseBody<
  '/v1/apps/{appId}/signing-keys',
  'post',
  201
>;

export class SigningKeysResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Counts the signing keys of the app.
   */
  public async count(options: CountSigningKeysOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/signing-keys/count', options),
    });
  }

  /**
   * Registers a public key. From then on, the app releases only signed bundles.
   * The key is `rsa-v1_5-sha256:` followed by the base64 SPKI DER of an RSA key of at least 2048 bits.
   * A key the app already holds answers its row unchanged, so the client retries the call.
   */
  public async create(options: CreateSigningKeyOptions): Promise<SigningKey> {
    const { appId, ...body } = options;
    return this.httpClient.fetchJson({
      body,
      isRetryable: true,
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
   * Lists the signing keys of the app, newest first.
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
