import NodeMediaServer from 'node-media-server';
import WebSocket from 'ws';
import { Jwt } from './utils/jwt';

const httpPort = parseInt(process.env.PORT || '8000', 10);
const LIVE_API = process.env.SERVER_ENDPOINT || '';
const LIVE_API_WS = LIVE_API.replace('http', 'ws');
const EDGE_WS = process.env.EDGE_ENDPOINT || '';

const nms = new NodeMediaServer({
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: false,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: httpPort,
    mediaroot: __dirname + '/media',
    allow_origin: '*'
  }
});
nms.run();

const jwk = new Jwt(`${LIVE_API}/v1/internals/edge/jwt`, 'edge');

let liveApi: WebSocket;
const connectLiveApi = () => {
  liveApi = new WebSocket(`${LIVE_API_WS}/websocket/v1/push`);

  liveApi.on('open', () => {
    console.log('live-api connected');
  });

  liveApi.on('message', data => {
    const msg = JSON.parse(data.toString()) as {
      action: 'end';
      liveId: number;
    };

    if (msg.action === 'end') {
      rejectSession(undefined, msg.liveId);
      closeSocket(msg.liveId);
    }
  });

  liveApi.on('close', () => {
    console.log('live-api disconnected');
    setTimeout(connectLiveApi, 1000);
  });
};
connectLiveApi();

type Session = {
  edgeSocket?: WebSocket;
  flvSocket?: WebSocket;
  liveId: number;
};

let sessions: Session[] = [];
const nmsIds: Record<number, string> = {};

const rejectSession = (sessionId?: string, liveId?: number) => {
  try {
    const nmsId = liveId ? nmsIds[liveId] : sessionId;
    if (!nmsId) {
      return;
    }

    const session = nms.getSession(nmsId) as unknown as
      | {
          reject: () => void;
        }
      | undefined;

    if (liveId) {
      delete nmsIds[liveId];
    }
    session?.reject();
  } catch (e) {
    console.warn('rejectSession', e);
  }
};

const closeSocket = (liveId: number) => {
  const session = sessions.find(s => s.liveId === liveId);
  if (!session) {
    return;
  }

  if (session.flvSocket) {
    try {
      session.flvSocket.close();
      session.flvSocket = undefined;
    } catch (e) {
      console.warn('closeSocket', e);
    }
  }

  if (session.edgeSocket) {
    try {
      session.edgeSocket.close();
      session.edgeSocket = undefined;
    } catch (e) {
      console.warn('closeSocket', e);
    }
  }

  sessions = sessions.filter(s => s.liveId !== liveId);
};

const checkSession = async (id: string, StreamPath: string, token: string) => {
  const [, key, liveId] = StreamPath.split('/');
  if (key !== 'live' || !liveId || !parseInt(liveId) || !token) {
    console.warn('invalid session', id, StreamPath, token);
    throw new Error('invalid session');
  }

  const res = await jwk.verify(token);
  if (!res) {
    console.warn('invalid token');
    throw new Error('invalid token');
  }

  if (res.type !== 'push' || res.liveId !== parseInt(liveId)) {
    console.warn('invalid live', res);
    throw new Error('invalid live');
  }

  const response = await fetch(`${LIVE_API}/v1/internals/push/check-token`, {
    method: 'POST',
    body: JSON.stringify({
      liveId: res.liveId,
      token
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    console.warn('check failed', res, await response.text());
    throw new Error('check failed');
  }
};

const onConnect = (sessionId: string, liveId: number, token: string) => {
  console.log('onConnect');

  rejectSession(undefined, liveId);
  closeSocket(liveId);
  nmsIds[liveId] = sessionId;

  liveApi.send(
    JSON.stringify({
      action: 'start',
      liveId,
      token
    })
  );

  try {
    const session: Session = { liveId };
    const edge = new WebSocket(
      `${EDGE_WS}/streaming/${liveId}/push?token=${token}`
    );
    session.edgeSocket = edge;
    sessions.push(session);

    edge.on('open', () => {
      console.log('edge connected', liveId);

      const stream = new WebSocket(`ws://localhost:${httpPort}/live/${liveId}`);
      session.flvSocket = stream;

      stream.on('open', () => {
        console.log('flv socket connected', liveId);
      });

      stream.on('message', data => {
        edge.send(data);
      });

      stream.on('close', () => {
        console.log('flv socket disconnected', liveId);
        closeSocket(liveId);
        rejectSession(sessionId);
      });
    });

    edge.on('close', () => {
      console.log('edge disconnected', liveId);

      if (session.flvSocket) {
        closeSocket(liveId);
        console.log('Edge Reconnecting...', liveId);
        onConnect(sessionId, liveId, token);
      } else {
        closeSocket(liveId);
        rejectSession(sessionId);
      }
    });
  } catch (e) {
    console.warn('onConnect', e);
    closeSocket(liveId);
    rejectSession(sessionId);
  }
};

nms.on('prePublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on prePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  void (async () => {
    try {
      const token = (args as Record<string, unknown>).token as string;
      await checkSession(id, StreamPath, token);
    } catch (e) {
      console.warn('prePublish', e);
      rejectSession(id);
    }
  })();
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on postPublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  void (async () => {
    try {
      const token = (args as Record<string, unknown>).token as string;
      await checkSession(id, StreamPath, token);

      const [, , liveId] = StreamPath.split('/');

      onConnect(id, parseInt(liveId), token);
    } catch (e) {
      console.warn('postPublish', e);
      rejectSession(id);
    }
  })();
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on donePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  void (async () => {
    try {
      const token = (args as Record<string, unknown>).token as string;
      await checkSession(id, StreamPath, token);

      const [, , liveId] = StreamPath.split('/');
      const LiveId = parseInt(liveId);

      closeSocket(LiveId);
      liveApi.send(
        JSON.stringify({
          action: 'stop',
          liveId,
          token
        })
      );
      delete nmsIds[LiveId];
    } catch (e) {
      console.warn('donePublish', e);
    }
  })();
});
