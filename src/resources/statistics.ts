import type { HttpClient } from '../http-client';
import { StatisticsFleetResource } from './statistics-fleet';

export class StatisticsResource {
  public readonly fleet: StatisticsFleetResource;

  constructor(httpClient: HttpClient) {
    this.fleet = new StatisticsFleetResource(httpClient);
  }
}
