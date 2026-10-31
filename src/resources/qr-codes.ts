import type { HttpClient } from '../http-client';
import { resolvePath } from '../http-client';
import type { QueryParameters } from '../types';

export type GetQrCodeOptions = QueryParameters<'/v1/qr-codes', 'get'>;

export class QrCodesResource {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Gets a URL on hotcodepush.com, one of its subdomains or the workers.dev subdomain of HotCodePush as a QR image.
   * The image is SVG unless `format` is `png`. A URL on another host answers `validation`. Needs no token.
   */
  public async get(options: GetQrCodeOptions): Promise<Blob> {
    return this.httpClient.fetchBlob({
      method: 'GET',
      path: resolvePath('/v1/qr-codes'),
      query: options,
    });
  }
}
