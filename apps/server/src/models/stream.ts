import { StreamStatus, PrismaClient, Stream } from '@prisma/client';

export const Streams = (client: PrismaClient['stream']) =>
  Object.assign(client, {
    create: async () => {
      const data = await client.create({
        data: {
          // status: StreamStatus.Provisioning
          status: StreamStatus.Ready
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
    },
    startStream: async (stream: Stream) => {
      if (
        stream.status === StreamStatus.Provisioning ||
        stream.status === StreamStatus.Ended
      ) {
        throw new Error('Stream is not ready');
      }

      const data = await client.update({
        where: {
          id: stream.id
        },
        data: {
          status: StreamStatus.Live,
          firstStartedAt: stream.firstStartedAt || new Date(),
          lastStartedAt: new Date(),
          lastEndedAt: null
        }
      });

      return data;
    },
    stopStream: async (stream: Stream) => {
      if (
        stream.status === StreamStatus.Provisioning ||
        stream.status === StreamStatus.Ended
      ) {
        throw new Error('Stream is not live');
      }

      const data = await client.update({
        where: {
          id: stream.id
        },
        data: {
          status: StreamStatus.Paused,
          lastEndedAt: new Date()
        }
      });

      return data;
    },
    endStream: async (stream: Stream) => {
      const data = await client.update({
        where: {
          id: stream.id
        },
        data: {
          status: StreamStatus.Ended
        }
      });

      return data;
    }
  });
