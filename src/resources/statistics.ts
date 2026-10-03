import type { HttpClient } from '../http-client';
import { StatisticsFleetResource } from './statistics-fleet';
import { StatisticsUpdatesResource } from './statistics-updates';
import { StatisticsUsageResource } from './statistics-usage';

export class StatisticsResource {
  public readonly fleet: StatisticsFleetResource;
  public readonly updates: StatisticsUpdatesResource;
  public readonly usage: StatisticsUsageResource;

  constructor(httpClient: HttpClient) {
    this.fleet = new StatisticsFleetResource(httpClient);
    this.updates = new StatisticsUpdatesResource(httpClient);
    this.usage = new StatisticsUsageResource(httpClient);
  }
}
