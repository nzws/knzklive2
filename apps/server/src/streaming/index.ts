import { Server } from 'http';
import WebSocket from 'ws';
import { lives, streams } from '../models';
import { pubsub } from '../redis/pubsub/client';
import { getCommentKey, getPushKey } from '../redis/pubsub/keys';
import { UserToken } from '../redis/user-token';
import { jwtEdge } from '../services/jwt';

const userToken = new UserToken();

export class Streaming {
  constructor(server: Server) {
    const ws = new WebSocket.Server({
      server
    });

    ws.on('connection', socket => {
      void this.handleConnection(socket);
    });
  }

  private handleConnection(socket: WebSocket) {
    const url = new URL(socket.url);
    const paths = url.pathname.split('/').filter(Boolean);
    const token = url.searchParams.get('token') || undefined;
    if (paths[0] !== 'websocket') {
      return this.closeConnection(socket, 'invalid_path');
    }

    const liveId = parseInt(paths[3], 10);
    if (!liveId || liveId <= 0) {
      return this.closeConnection(socket, 'invalid_live_id');
    }

    if (paths[1] === 'v1' && paths[2] === 'comments') {
      return this.handleV1Comments(socket, liveId, token);
    } else if (paths[1] === 'v1' && paths[2] === 'push') {
      if (!token) {
        return this.closeConnection(socket, 'invalid_token');
      }

      return this.handleV1Push(socket, liveId, token);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1Comments(
    socket: WebSocket,
    liveId: number,
    token?: string
  ) {
    let userId: number | undefined;
    if (token) {
      userId = await userToken.get(token);
      if (!userId) {
        return this.closeConnection(socket, 'invalid_token');
      }
    }
    // todo: privacy authentication
    console.log('websocket connected', liveId, userId);

    const handle = {
      event: getCommentKey(liveId),
      callback: (message: string) => {
        socket.send(message);
      }
    };

    socket.once('close', () => {
      console.log('websocket closed');
      pubsub.off(handle);
    });

    await pubsub.on(handle);
  }

  private async handleV1Push(socket: WebSocket, liveId: number, token: string) {
    const payload = await jwtEdge.verify(token);
    if (!payload) {
      return this.closeConnection(socket, 'invalid_token');
    }
    if (payload.liveId !== liveId || payload.type !== 'push') {
      return this.closeConnection(socket, 'invalid_token');
    }
    const live = await lives.findUnique({
      where: {
        id: liveId
      },
      include: {
        stream: true
      }
    });
    if (!live) {
      return this.closeConnection(socket, 'invalid_live_id');
    }

    socket.on('message', message => {
      try {
        const msg = JSON.parse(message.toString()) as {
          action: 'start' | 'stop';
        };
        if (msg.action === 'start') {
          void streams.startStream(live.stream);
        } else if (msg.action === 'stop') {
          void streams.stopStream(live.stream);
        }
      } catch (e) {
        console.error(e);
      }
    });

    const handle = {
      event: getPushKey(liveId),
      callback: (message: string) => {
        socket.send(message);
      }
    };

    socket.once('close', () => {
      console.log('websocket closed');
      pubsub.off(handle);
    });

    await pubsub.on(handle);
  }

  private closeConnection(socket: WebSocket, error?: string) {
    if (error) {
      socket.emit('error', error);
    }
    socket.close();
  }
}
