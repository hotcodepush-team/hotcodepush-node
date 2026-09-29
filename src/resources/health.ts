import type { HttpClient } from '../http-client';

export class HealthResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Resolves when the API is healthy and throws a `HotCodePushError` when it is not.
   */
  public async get(): Promise<void> {
    await this.httpClient.fetchJson({ method: 'GET', path: '/health' });
  }
}
