import { Server } from 'http';
import WebSocket from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { lives, streams } from '../models';
import { pubsub } from '../redis/pubsub/client';
import { getCommentKey, getPushKey } from '../redis/pubsub/keys';
import { UserToken } from '../redis/user-token';
import { jwtEdge } from '../services/jwt';
import { LiveStream } from '../redis/live-stream';

const userToken = new UserToken();
const liveStream = new LiveStream();

const commentsRegexp = pathToRegexp('/websocket/v1/stream/:liveId');
const pushRegexp = pathToRegexp('/websocket/v1/push');

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
    const push = pushRegexp.exec(url.pathname);
    if (comments) {
      const liveId = Number(comments[1]);
      return this.handleV1Comments(socket, ip, liveId, token);
    } else if (push) {
      return this.handleV1Push(socket);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1Comments(
    socket: WebSocket,
    ip: string,
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
    await liveStream.add(liveId, ip);

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
      void liveStream.remove(liveId, ip);
    });

    await pubsub.on(handle);
  }

  private async handleV1Push(socket: WebSocket) {
    socket.on('message', message => {
      void (async () => {
        try {
          const msg = JSON.parse(message.toString()) as {
            liveId: string;
            token: string;
            action: 'start' | 'stop';
          };
          const liveId = Number(msg.liveId);

          const live = await this.getStream(liveId, msg.token);
          if (!live) {
            console.warn('invalid push token', msg);

            socket.send(
              JSON.stringify({
                action: 'end',
                liveId: msg.liveId
              })
            );
            return;
          }
          await pubsub.subscribe(getPushKey(liveId));

          if (msg.action === 'start') {
            try {
              void streams.startStream(live.stream);
            } catch (e) {
              console.warn(e);

              socket.send(
                JSON.stringify({
                  action: 'end',
                  liveId: msg.liveId
                })
              );
            }
          } else if (msg.action === 'stop') {
            void streams.stopStream(live.stream);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    });

    const handle = {
      firehoseEvent: 'push:',
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

  private async getStream(liveId: number, token: string) {
    const payload = await jwtEdge.verify(token);
    if (!payload) {
      return;
    }
    if (payload.liveId !== liveId || payload.type !== 'push') {
      return;
    }
    const live = await lives.findUnique({
      where: {
        id: liveId
      },
      include: {
        stream: true
      }
    });

    return live;
  }

  private closeConnection(socket: WebSocket, error?: string) {
    if (error) {
      socket.emit('error', error);
    }
    socket.close();
  }
}
