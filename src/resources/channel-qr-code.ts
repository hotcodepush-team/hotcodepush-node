import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { PathParameters, QueryParameters } from '../types';

export type GetChannelQrCodeOptions = PathParameters<
  '/v1/apps/{appId}/channels/{channelId}/qr-code',
  'get'
> &
  QueryParameters<'/v1/apps/{appId}/channels/{channelId}/qr-code', 'get'>;

export class ChannelQrCodeResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Gets the deep link of the channel as a QR image, built from the `channelLinkTemplate` of the app.
   * The image is SVG unless `format` is `png`. Answers `not_found` while the template is unset.
   */
  public async get(options: GetChannelQrCodeOptions): Promise<Blob> {
    const { appId, channelId, ...query } = options;
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/apps/{appId}/channels/{channelId}/qr-code', {
        appId,
        channelId,
      }),
      query,
    });
  }
}
