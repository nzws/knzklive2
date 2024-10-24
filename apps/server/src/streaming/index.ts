import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { comments, lives } from '../models';
import { pubsub } from '../services/redis/pubsub/client';
import { getLiveUpdateKey } from '../services/redis/pubsub/keys';
import { UserToken } from '../services/redis/user-token';
import { jwtCommentViewer } from '../services/jwt';
import { LiveUpdateCommentCreated } from 'api-types/streaming/live-update';

const userToken = new UserToken();

const liveUpdateRegexp = pathToRegexp('/websocket/v1/live/:liveId');

export class Streaming {
  constructor(server: Server) {
    const ws = new WebSocketServer({
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

    const live = liveUpdateRegexp.exec(url.pathname);
    if (live) {
      const liveId = Number(live[1]);
      return this.handleV1LiveUpdate(socket, liveId, url.searchParams);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1LiveUpdate(
    socket: WebSocket,
    liveId: number,
    params: URLSearchParams
  ) {
    const token = params.get('token');
    const commentAfter = Number(params.get('commentAfter') || 0);
    const verifyAsViewer =
      token && (await jwtCommentViewer.verifyToken(token, liveId));

    if (!verifyAsViewer) {
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
      const isAccessible = await lives.isAccessibleInformationByUser(
        live,
        userId
      );
      if (!isAccessible) {
        return this.closeConnection(socket, 'forbidden_live');
      }
    }

    console.log('websocket connected', liveId);

    const recentComments = await comments.getComments(liveId, commentAfter);
    socket.send(
      JSON.stringify({
        type: 'comment:created',
        data: recentComments.map(comments.getPublic).filter(Boolean)
      } as LiveUpdateCommentCreated)
    );

    const handle = {
      event: getLiveUpdateKey(liveId),
      callback: (message: string) => {
        socket.send(message);
      }
    };

    socket.on('message', message => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
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
