import { Server } from 'http';
import { WebSocketServer } from 'ws';
import WebSocket from 'ws';
import { pathToRegexp } from 'path-to-regexp';
import { Encoder } from '../services/encoder';
import { Readable } from 'stream';
import { checkToken } from '../utils/api';

const streamPushRegexp = pathToRegexp(
  '/api/externals/websocket/v1/stream-push/:liveId'
);
const streamWatchRegexp = pathToRegexp(
  '/api/externals/websocket/v1/stream-watch/:liveId'
);

export class Streaming {
  constructor(server: Server) {
    const ws = new WebSocketServer({
      server
    });

    ws.on('connection', (socket, req) => {
      void (async () => {
        try {
          console.log('websocket connected', req.url);

          if (req.url) {
            await this.handleConnection(socket, req.url);
          }
        } catch (e) {
          console.warn(e);
          socket.close();
        }
      })();
    });
  }

  private async handleConnection(socket: WebSocket, Url: string) {
    const url = new URL(Url, process.env.SERVER_ENDPOINT);
    const watchToken = url.searchParams.get('watchToken') || undefined;
    const token = url.searchParams.get('token') || undefined;

    const streamPush = streamPushRegexp.exec(url.pathname);
    const streamWatch = streamWatchRegexp.exec(url.pathname);

    if (streamPush) {
      const liveId = Number(streamPush[1]);
      if (!token || !watchToken) {
        return this.closeConnection(socket, 'Token is required');
      }
      try {
        await this.handleV1Push(socket, liveId, watchToken, token);
        return;
      } catch (e) {
        console.error(e);
        return this.closeConnection(socket, 'An error occurred');
      }
    } else if (streamWatch) {
      const liveId = Number(streamWatch[1]);
      if (!token || !watchToken) {
        return this.closeConnection(socket, 'Token is required');
      }
      try {
        await this.handleV1Watch(socket, liveId, watchToken, token);
        return;
      } catch (e) {
        console.error(e);
        return this.closeConnection(socket, 'An error occurred');
      }
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

  private async handleV1Watch(
    socket: WebSocket,
    liveId: number,
    watchToken: string,
    token: string
  ) {
    const url = `http://localhost:8080/streaming/live/${liveId}_${watchToken}.flv?token=${token}`;
    console.log('websocket connected', liveId);
    const response = await fetch(url);

    if (!response.ok) {
      return this.closeConnection(
        socket,
        `Failed to connect: ${response.status}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return this.closeConnection(socket, 'Failed to get reader');
    }

    let success = false;
    while (!success) {
      const { done, value } = await reader.read();
      if (done || socket.readyState !== WebSocket.OPEN) {
        success = true;
        socket.close();
        break;
      }

      socket.send(value, err => {
        if (err) {
          console.error('[handleV1Watch] failed to send data', err);
          this.closeConnection(socket, 'Failed to send data');
          success = true;
        }
      });
    }

    console.log('websocket closed', liveId);
  }

  private closeConnection(socket: WebSocket, error?: string) {
    if (error) {
      socket.send(JSON.stringify({ error }));
    }
    socket.close();
  }
}
