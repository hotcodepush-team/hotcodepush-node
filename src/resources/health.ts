import type { HttpClient } from '../http-client';

export class HealthResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Checks that the API is up: resolves when it answers its plain-text `ok`.
   * `unavailable` or any other status outside 2xx throws a `HotCodePushError`.
   */
  public async get(): Promise<void> {
    await this.httpClient.fetchStatus({ method: 'GET', path: '/health' });
  }
}
