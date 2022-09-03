import Cloudflare from 'cloudflare';
import { DNS } from './_base';

const token = process.env.CLOUDFLARE_TOKEN;
const cloudflare = new Cloudflare({ token });

export class DNSCloudflare extends DNS {
  async createARecord(name: string, address: string) {
    //
  }
}
