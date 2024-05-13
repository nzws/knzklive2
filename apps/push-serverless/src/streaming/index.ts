import { Server } from 'http';
import WebSocket from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { Encoder } from '../services/encoder';
import { Readable } from 'stream';
import { checkToken } from '../utils/api';

const streamPushRegexp = pathToRegexp(
  '/api/externals/websocket/v1/stream-push/:liveId'
);

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
    const watchToken = url.searchParams.get('watchToken') || undefined;
    const token = url.searchParams.get('token') || undefined;

    const streamPush = streamPushRegexp.exec(url.pathname);
    if (streamPush) {
      const liveId = Number(streamPush[1]);
      if (!token || !watchToken) {
        return this.closeConnection(socket, 'Token is required');
      }
      return this.handleV1Push(socket, liveId, watchToken, token);
    }

    return this.closeConnection(socket, 'invalid_path');
  }

  private async handleV1Push(
    socket: WebSocket,
    liveId: number,
    watchToken: string,
    token: string
  ) {
    if (!(await checkToken(liveId, watchToken, token))) {
      return this.closeConnection(socket, 'invalid_token');
    }

    const encoder = new Encoder(liveId, watchToken, token);
    const stream = new Readable({
      read() {
        //
      }
    });

    console.log('websocket connected', liveId);

    socket.on('message', (data: WebSocket.Data) => {
      if (data instanceof Buffer) {
        stream.push(data);
      }
    });

    socket.on('close', () => {
      console.log('websocket closed', liveId);
      stream.destroy();
      void encoder.cleanup(false);
    });

    stream.on('end', () => {
      console.log('stream ended', liveId);
      socket.close();
    });

    const ffmpeg = encoder.publishToRtmp(stream);

    ffmpeg.on('error', (err: unknown) => {
      if (err instanceof Error && !err.message.includes('SIGKILL')) {
        this.closeConnection(socket, 'An error occurred in encoder');
      }
    });

    socket.send(JSON.stringify({ type: 'ready' }));
  }

  private closeConnection(socket: WebSocket, error?: string) {
    if (error) {
      socket.send(JSON.stringify({ error }));
    }
    socket.close();
  }
}
