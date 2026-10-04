import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type {
  Count,
  IdempotencyOptions,
  JsonRequestBody,
  JsonResponseBody,
  PathParameters,
  QueryParameters,
} from '../types';

export type CountDeploymentKeysOptions = PathParameters<
  '/v1/apps/{appId}/deployment-keys/count',
  'get'
>;

export type CreateDeploymentKeyOptions = PathParameters<
  '/v1/apps/{appId}/deployment-keys',
  'post'
> &
  JsonRequestBody<'/v1/apps/{appId}/deployment-keys', 'post'> &
  IdempotencyOptions;

export type DeleteDeploymentKeyOptions = PathParameters<
  '/v1/apps/{appId}/deployment-keys/{key}',
  'delete'
>;

/**
 * A CodePush bridge key: the channel and the platform a legacy CodePush client checks under.
 */
export type DeploymentKey = JsonResponseBody<
  '/v1/apps/{appId}/deployment-keys',
  'post',
  201
>;

export type ListDeploymentKeysOptions = PathParameters<
  '/v1/apps/{appId}/deployment-keys',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/deployment-keys', 'get'>;

export class DeploymentKeysResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The number of the app's deployment keys.
   */
  public async count(options: CountDeploymentKeysOptions): Promise<Count> {
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/deployment-keys/count', options),
    });
  }

  /**
   * Issues a key for a channel and a platform, which a CodePush client is configured with.
   */
  public async create(
    options: CreateDeploymentKeyOptions,
  ): Promise<DeploymentKey> {
    const { appId, idempotencyKey, ...body } = options;
    return this.httpClient.fetchCreatingPost({
      body,
      idempotencyKey,
      path: resolvePath('/v1/apps/{appId}/deployment-keys', { appId }),
    });
  }

  /**
   * Retires a key once no legacy client checks under it.
   */
  public async delete(options: DeleteDeploymentKeyOptions): Promise<void> {
    await this.httpClient.fetchJson({
      method: 'DELETE',
      path: resolvePath('/v1/apps/{appId}/deployment-keys/{key}', options),
    });
  }

  /**
   * The app's deployment keys, newest first.
   */
  public async list(
    options: ListDeploymentKeysOptions,
  ): Promise<DeploymentKey[]> {
    const { appId, ...query } = options;
    return this.httpClient.fetchJson({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/deployment-keys', { appId }),
      query,
    });
  }
}
