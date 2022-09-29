import { Server } from 'http';
import WebSocket from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { lives } from '../models';
import { pubsub } from '../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../services/redis/pubsub/keys';
import { UserToken } from '../services/redis/user-token';
import { jwtCommentViewer } from '../services/jwt';

const userToken = new UserToken();

const liveUpdateRegexp = pathToRegexp('/websocket/v1/live/:liveId');

export class Streaming {
  constructor(server: Server) {
    const ws = new WebSocket.Server({
      server
    });

    ws.on('connection', (socket, req) => {
      try {
        console.log('websocket connected', req.url);
        if (req.url) {
          void this.handleConnection(socket, req.url);
        }
      } catch (e) {
        console.warn(e);
        socket.close();
      }
    });
  }

  private handleConnection(socket: WebSocket, Url: string) {
    const url = new URL(Url, process.env.SERVER_ENDPOINT);
    const token = url.searchParams.get('token') || undefined;

    const live = liveUpdateRegexp.exec(url.pathname);
    if (live) {
      const liveId = Number(live[1]);
      return this.handleV1LiveUpdate(socket, liveId, token);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1LiveUpdate(
    socket: WebSocket,
    liveId: number,
    token?: string
  ) {
    const verifyAsStreamer =
      token && (await jwtCommentViewer.verifyToken(token, liveId));
    console.log(token, verifyAsStreamer);

    if (!verifyAsStreamer) {
      let userId: number | undefined;
      if (token) {
        userId = await userToken.get(token);
        if (!userId) {
          return this.closeConnection(socket, 'invalid_token');
        }
      }
      const live = await lives.get(liveId);
      if (!live) {
        return this.closeConnection(socket, 'live_not_found');
      }
      if (!lives.isAccessibleInformationByUser(live, userId)) {
        return this.closeConnection(socket, 'forbidden_live');
      }
    }

    console.log('websocket connected', liveId);

    const handle = {
      event: getLiveUpdateKey(liveId),
      callback: (message: string) => {
        socket.send(message);
      }
    };

    socket.on('message', message => {
      if (message.toString() === 'ping') {
        socket.send('pong');
      }
    });

    socket.once('close', () => {
      console.log('websocket closed');
      pubsub.off(handle);
    });

    await pubsub.on(handle);
  }

  private closeConnection(socket: WebSocket, error?: string) {
    if (error) {
      socket.send(JSON.stringify({ error }));
    }
    socket.close();
  }
}
