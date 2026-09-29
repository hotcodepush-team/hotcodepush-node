import type { HttpClientOptions } from './http-client';
import { HttpClient } from './http-client';
import { HealthResource } from './resources/health';

export type HotCodePushOptions = HttpClientOptions;

/**
 * The client for the HotCodePush REST API.
 */
export class HotCodePush {
  public readonly health: HealthResource;

  constructor(options: HotCodePushOptions = {}) {
    const httpClient = new HttpClient(options);
    this.health = new HealthResource(httpClient);
  }
}
