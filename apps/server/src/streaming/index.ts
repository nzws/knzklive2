import { Server } from 'http';
import WebSocket from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { lives } from '../models';
import { pubsub } from '../redis/pubsub/client';
import { getCommentKey } from '../redis/pubsub/keys';
import { UserToken } from '../redis/user-token';
import { jwtCommentViewer } from '../services/jwt';

const userToken = new UserToken();

const commentsRegexp = pathToRegexp('/websocket/v1/stream/:liveId');

export class Streaming {
  constructor(server: Server) {
    const ws = new WebSocket.Server({
      server
    });

    ws.on('connection', (socket, req) => {
      const ip = req.socket.remoteAddress;

      try {
        console.log('websocket connected', req.url);
        if (req.url) {
          void this.handleConnection(socket, req.url, ip);
        }
      } catch (e) {
        console.warn(e);
        socket.close();
      }
    });
  }

  private handleConnection(socket: WebSocket, Url: string, ip?: string) {
    const url = new URL(Url, process.env.SERVER_ENDPOINT);
    const token = url.searchParams.get('token') || undefined;
    if (!ip) {
      return this.closeConnection(socket, 'invalid_ip');
    }

    const comments = commentsRegexp.exec(url.pathname);
    if (comments) {
      const liveId = Number(comments[1]);
      return this.handleV1Comments(socket, ip, liveId, token);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1Comments(
    socket: WebSocket,
    ip: string,
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
      if (live.endedAt) {
        return this.closeConnection(socket, 'ended_live');
      }
    }

    console.log('websocket connected', liveId);

    const handle = {
      event: getCommentKey(liveId),
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
