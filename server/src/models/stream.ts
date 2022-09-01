import crypto from 'crypto';
import { StreamStatus, PrismaClient, StreamProvider } from '@prisma/client';

// todo
const serverUrl = 'rtmp://push.knzk.live/';

export const Streams = (client: PrismaClient['stream']) =>
  Object.assign(client, {
    createAsKnzk: async () => {
      const streamKey = crypto.randomBytes(48).toString('hex');

      const data = await client.create({
        data: {
          provider: StreamProvider.Knzk,
          status: StreamStatus.Provisioning,
          serverUrl,
          streamKey
        }
      });

      return data;
    },
    get: async (id: number) => {
      const data = await client.findUnique({
        where: {
          id
        }
      });

      return data || undefined;
    }
  });
