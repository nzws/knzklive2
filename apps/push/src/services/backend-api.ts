import WebSocket from 'ws';

const LIVE_API = process.env.SERVER_ENDPOINT || '';
const LIVE_API_WS = LIVE_API.replace('http', 'ws');

export interface ToPushMessage {
  action: 'end';
  liveId: number;
}

export interface ToBackendMessage {
  action: 'start' | 'stop';
  liveId: number;
  token: string;
}

export class BackendApi {
  connection?: WebSocket;
  timeout?: NodeJS.Timeout;

  constructor(private onMessage: (msg: ToPushMessage) => void) {
    this.connect();
  }

  private connect() {
    try {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      console.log('connecting to live-api');
      const ws = new WebSocket(`${LIVE_API_WS}/websocket/v1/push`);
      this.connection = ws;

      ws.on('open', () => {
        console.log('live-api connected');
      });

      ws.on('message', data => {
        try {
          const msg = JSON.parse(data.toString()) as ToPushMessage;

          this.onMessage(msg);
        } catch (e) {
          console.warn(e);
        }
      });

      ws.on('error', data => {
        console.warn('live-api error', data);
        this.requestReconnect();
      });

      ws.on('close', () => {
        console.log('live-api disconnected, reconnecting...');
        this.requestReconnect();
      });
    } catch (e) {
      console.warn('connectLiveApi', e);
      this.requestReconnect();
    }
  }

  send(msg: ToBackendMessage) {
    if (!this.connection) {
      throw new Error('no connection');
    }

    this.connection.send(JSON.stringify(msg));
  }

  private disconnect() {
    try {
      if (this.connection) {
        this.connection.close();
        this.connection.removeAllListeners();
      }
    } catch (e) {
      console.warn(e);
    }

    this.connection = undefined;
  }

  private requestReconnect() {
    this.disconnect();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(() => {
      this.connect();
    }, 500);
  }

  static async checkToken(
    liveId: number,
    token: string,
    ignoreEndedAtCheck: boolean
  ) {
    const response = await fetch(`${LIVE_API}/v1/internals/push/check-token`, {
      method: 'POST',
      body: JSON.stringify({
        liveId,
        token,
        ignoreEndedAtCheck
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('check failed', await response.text());
      throw new Error('check failed');
    }
  }
}
