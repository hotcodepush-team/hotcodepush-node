import type { HttpClient } from '../http-client';

export class HealthResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Resolves when the API answers its plain-text `ok`; `unavailable`, or any other status outside 2xx, throws a `HotCodePushError`.
   */
  public async get(): Promise<void> {
    await this.httpClient.fetchStatus({ method: 'GET', path: '/health' });
  }
}
