import { Jwt } from './utils/jwt';

export interface Env {
  STREAMING_DURABLE_OBJECT: DurableObjectNamespace;
  SERVER_ENDPOINT: string;
}

interface Session {
  socket: WebSocket;
  type: 'stream' | 'push';
}

export class StreamingDurableObject {
  private sessions: Session[] = [];
  private headPackets: ArrayBuffer[] = [];

  constructor(private state: DurableObjectState) {
    this.state = state;
    this.sessions = [];
    this.headPackets = [];
  }

  fetch(request: Request) {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Upgrade required', { status: 426 });
    }
    const [client, server] = Object.values(new WebSocketPair());

    if (url.pathname === '/stream') {
      const push = this.sessions.find(session => session.type === 'push');
      if (!push) {
        return new Response('no push session', { status: 400 });
      }

      server.accept();
      const session: Session = { socket: server, type: 'stream' };
      this.headPackets.forEach(packet => server.send(packet));
      this.sessions.push(session);

      server.addEventListener('close', () => this.handleClose(session));
      server.addEventListener('error', () => this.handleClose(session));

      return new Response(null, { status: 101, webSocket: client });
    } else if (url.pathname === '/push') {
      const prevPush = this.sessions.find(session => session.type === 'push');
      if (prevPush) {
        this.handleClose(prevPush);
      }

      server.accept();
      const session: Session = { socket: server, type: 'push' };
      this.sessions.push(session);
      this.headPackets = [];

      let headRecorded = false;

      server.addEventListener('message', event => {
        if (event.data instanceof ArrayBuffer) {
          // todo: get flv header
          if (!headRecorded) {
            this.headPackets.push(event.data);

            if (this.hasHeadPackets()) {
              headRecorded = true;
              this.headPackets.forEach(packet => this.broadcast(packet));
            }
          }

          this.broadcast(event.data);
        } else {
          console.log('unexpected message', event.data);
        }
      });
      server.addEventListener('close', () => this.closeAll());

      return new Response(null, { status: 101, webSocket: client });
    } else {
      return new Response('not found', { status: 404 });
    }
  }

  private handleClose(session: Session) {
    session.socket.close();
    this.sessions = this.sessions.filter(s => s !== session);
  }

  private broadcast(message: ArrayBuffer) {
    if (!this.hasHeadPackets()) {
      return;
    }

    this.sessions = this.sessions.filter(session => {
      if (session.type === 'stream') {
        try {
          session.socket.send(message);
          return true;
        } catch (err) {
          // maybe disconnected
          return false;
        }
      } else {
        return true;
      }
    });
  }

  private closeAll() {
    this.sessions.forEach(session => session.socket.close());
    this.sessions = [];
  }

  private hasHeadPackets() {
    // todo: 必要なヘッダーってどれ？？
    return this.headPackets.length === 4;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const jwk = new Jwt(`${env.SERVER_ENDPOINT}/v1/internals/edge/jwt`, 'edge');
    const url = new URL(request.url);
    const paths = url.pathname.split('/').filter(p => p);

    if (paths[0] === 'streaming') {
      const liveId = paths[1];
      if (!parseInt(liveId, 10)) {
        return new Response('invalid live id', { status: 400 });
      }

      const token = url.searchParams.get('token');
      if (!token) {
        return new Response('token required', { status: 403 });
      }
      const payload = await jwk.verify(token);
      if (!payload) {
        return new Response('invalid token', { status: 403 });
      }

      const id = env.STREAMING_DURABLE_OBJECT.idFromName(liveId);
      const streaming = env.STREAMING_DURABLE_OBJECT.get(id);

      const action = paths[2];
      if (action === 'stream' || action === 'push') {
        const newUrl = new URL(request.url);
        newUrl.pathname = `/${action}`;

        if (
          payload.type !== action ||
          payload.liveId !== parseInt(liveId, 10)
        ) {
          return new Response('invalid request', { status: 403 });
        }

        //@ts-expect-error: string?
        return streaming.fetch(newUrl, request);
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
