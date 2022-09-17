import { WebSocket } from 'ws';
import http, { IncomingMessage } from 'http';
import { FlvPacket, FlvStreamParser } from 'node-flv';

const EDGE_WS = process.env.EDGE_ENDPOINT || '';

export class FlvStream {
  connecting = true;

  connectionEdge?: WebSocket;
  timeoutEdge?: NodeJS.Timeout;
  retryCountEdge = 0;
  headSentToEdge = false;

  connectionLocal?: http.IncomingMessage;
  timeoutLocal?: NodeJS.Timeout;
  retryCountLocal = 0;
  headPackets: FlvPacket[] = [];
  flvStream?: FlvStreamParser;

  constructor(
    private liveId: number,
    private token: string,
    private url: string
  ) {
    void this.connectLocal();
    this.connectEdge();
  }

  private httpRequest(url: string) {
    return new Promise<IncomingMessage>((resolve, reject) => {
      http
        .get(url, res => {
          const { statusCode } = res;
          if (statusCode !== 200) {
            res.resume();
            reject(
              new Error(
                'Request Failed.\n' + `Status Code: ${statusCode || '?'}`
              )
            );
            return;
          }

          resolve(res);
        })
        .on('error', e => {
          reject(e);
        });
    });
  }

  async connectLocal() {
    if (!this.connecting) {
      return;
    }

    const res = await this.httpRequest(this.url);
    this.connectionLocal = res;
    this.retryCountLocal = 0;
    console.log('local connected', this.liveId);

    const parser = new FlvStreamParser();
    this.flvStream = parser;

    res.pipe(parser);

    let header: FlvPacket;
    let firstMetaData: FlvPacket | undefined;
    let firstAudioData: FlvPacket | undefined;
    let firstVideoData: FlvPacket | undefined;

    parser.on('flv-header', (flvHeader: FlvPacket) => {
      console.log('flv-header', this.liveId, flvHeader);
      header = flvHeader;
      firstMetaData = undefined;
      firstAudioData = undefined;
      firstVideoData = undefined;
    });

    parser.on('flv-packet', (flvTag: FlvPacket) => {
      if (flvTag.type === 'metadata' && !firstMetaData) {
        console.log('first metadata', this.liveId, flvTag);
        firstMetaData = flvTag;
      } else if (flvTag.type === 'audio' && !firstAudioData) {
        console.log('first audio', this.liveId, flvTag);
        firstAudioData = flvTag;
      } else if (flvTag.type === 'video' && !firstVideoData) {
        console.log('first video', this.liveId, flvTag);
        firstVideoData = flvTag;
      }
      if (flvTag.type === 'unknown') {
        console.log('unknown', this.liveId, flvTag);
      }

      if (
        !this.headSentToEdge &&
        header &&
        //firstMetaData &&
        firstAudioData &&
        firstVideoData
      ) {
        this.headPackets = [
          header,
          //firstMetaData,
          firstAudioData,
          firstVideoData
        ];
        this.headSendToEdge();
      }

      if (this.connectionEdge && this.headSentToEdge) {
        this.connectionEdge.send(flvTag.build());
      }
    });

    res.on('end', () => {
      console.log('local flv end');
      this.requestReconnectLocal();
    });

    res.on('error', e => {
      console.log('local flv error', e);
      this.requestReconnectLocal();
    });
  }

  private disconnectLocal() {
    try {
      if (this.timeoutLocal) {
        clearTimeout(this.timeoutLocal);
      }
      this.flvStream?.destroy();
      this.connectionLocal?.destroy();
    } catch (e) {
      console.warn(e);
    }

    this.connectionLocal = undefined;
    this.flvStream = undefined;
    this.headPackets = [];
  }

  private requestReconnectLocal() {
    this.disconnectLocal();

    if (this.retryCountLocal > 5) {
      console.log('local: retry count exceeded, stopping', this.liveId);
      this.disconnectAll();
      return;
    }
    this.timeoutLocal = setTimeout(() => {
      void this.connectLocal();
    }, 500);
  }

  disconnectAll() {
    this.connecting = false;
    this.disconnectEdge();
    this.disconnectLocal();
  }

  connectEdge() {
    try {
      if (this.timeoutEdge) {
        clearTimeout(this.timeoutEdge);
      }
      if (!this.connecting) {
        return;
      }

      console.log('connecting to edge', this.liveId);
      const ws = new WebSocket(
        `${EDGE_WS}/streaming/${this.liveId}/push?token=${this.token}`
      );
      this.connectionEdge = ws;

      ws.on('open', () => {
        console.log('edge connected');
        this.retryCountEdge = 0;
        this.headSentToEdge = false;

        this.headSendToEdge();
      });

      ws.on('error', data => {
        console.warn('edge error', data);
        this.requestReconnectEdge();
      });

      ws.on('close', () => {
        console.log('edge disconnected, reconnecting...');
        this.requestReconnectEdge();
      });
    } catch (e) {
      console.warn('connectEdge', e);
      this.requestReconnectEdge();
    }
  }

  private disconnectEdge() {
    try {
      if (this.connectionEdge) {
        this.connectionEdge.close();
        this.connectionEdge.removeAllListeners();
      }
    } catch (e) {
      console.warn(e);
    }

    this.connectionEdge = undefined;
  }

  private requestReconnectEdge() {
    this.disconnectEdge();
    if (this.timeoutEdge) {
      clearTimeout(this.timeoutEdge);
    }
    if (this.retryCountEdge > 5) {
      console.log('local: retry count exceeded, stopping', this.liveId);
      this.disconnectAll();
      return;
    }
    this.timeoutEdge = setTimeout(() => {
      this.connectEdge();
    }, 500);
  }

  private headSendToEdge() {
    if (
      this.headSentToEdge ||
      this.headPackets.length !== 3 ||
      !this.connectionEdge
    ) {
      return;
    }

    console.log(
      'sending head to edge',
      this.liveId,
      this.headSentToEdge,
      this.headPackets,
      !!this.connectionEdge
    );

    this.headPackets.forEach(p => {
      this.connectionEdge?.send(p.build());
    });
    this.headSentToEdge = true;
  }
}
