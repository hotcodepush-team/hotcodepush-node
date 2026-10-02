import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, QueryParameters } from '../types';

export type GetChannelQrOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/qr',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels/{channelId}/qr', 'get'>;

export class ChannelQrResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * The channel's deep link from the app's `channelLinkTemplate` as a QR image, SVG unless `format` is `png`;
   * `E_NOT_FOUND` while the template is unset.
   */
  public async get(options: GetChannelQrOptions): Promise<Blob> {
    const { appId, channelId, ...query } = options;
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/qr', {
        appId,
        channelId,
      }),
      query,
    });
  }
}
