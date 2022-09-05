export interface Env {
  STREAMING_DURABLE_OBJECT: DurableObjectNamespace;
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
      return new Response('expected websocket', { status: 400 });
    }
    const [client, server] = Object.values(new WebSocketPair());

    console.log(url.pathname);
    console.log(this.sessions);

    if (url.pathname === '/stream') {
      // todo: authenticate
      server.accept();
      const session: Session = { socket: server, type: 'stream' };

      this.headPackets.forEach(packet => server.send(packet));

      this.sessions.push(session);
      server.addEventListener('close', () => this.handleClose(session));
      server.addEventListener('error', () => this.handleClose(session));

      return new Response(null, { status: 101, webSocket: client });
    } else if (url.pathname === '/push') {
      // todo: authenticate
      // const session: Session = { socket: server, type: "push" };
      // this.sessions.push(session);
      // server.addEventListener("close", () => this.handleClose(session));
      // server.addEventListener("error", () => this.handleClose(session));

      let headRecorded = false;

      server.accept();
      server.addEventListener('message', event => {
        if (event.data instanceof ArrayBuffer) {
          if (!headRecorded) {
            this.headPackets.push(event.data);

            if (this.hasHeadPackets()) {
              headRecorded = true;
              this.headPackets.forEach(packet => this.broadcast(packet));
            } else {
              return;
            }
          }

          this.broadcast(event.data);
        } else {
          console.log('unexpected message', event.data);
        }
      });

      return new Response(null, { status: 101, webSocket: client });
    } else {
      return new Response('not found', { status: 404 });
    }
  }

  private handleClose(session: Session) {
    this.sessions = this.sessions.filter(s => s !== session);
  }

  broadcast(message: ArrayBuffer) {
    if (!this.hasHeadPackets()) {
      return;
    }

    this.sessions = this.sessions.filter(session => {
      try {
        session.socket.send(message);
        return true;
      } catch (err) {
        // maybe disconnected
        return false;
      }
    });
  }

  private hasHeadPackets() {
    // todo: 必要なヘッダーってどれ？？
    return this.headPackets.length === 4;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const paths = url.pathname.split('/').filter(p => p);

    if (paths[0] === 'streaming') {
      const liveId = paths[1];
      const id = env.STREAMING_DURABLE_OBJECT.idFromName(liveId);
      const streaming = env.STREAMING_DURABLE_OBJECT.get(id);

      const action = paths[2];
      const actions = ['stream', 'push'];
      if (actions.includes(action)) {
        const newUrl = new URL(request.url);
        newUrl.pathname = `/${action}`;

        //@ts-expect-error: string?
        return streaming.fetch(newUrl, request);
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
