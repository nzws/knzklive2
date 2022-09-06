import NodeMediaServer from 'node-media-server';
import WebSocket from 'ws';
import { Jwt } from './utils/jwt';

const httpPort = parseInt(process.env.PORT || '8000', 10);
const LIVE_API = 'https://api.knzk.live';
const EDGE_WS = 'wss://edge.knzk.live';

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

type Session = {
  edgeSocket?: WebSocket;
  flvSocket?: WebSocket;
  liveId: number;
};
let sessions: Session[] = [];

const rejectSession = (id: string) => {
  try {
    const session = nms.getSession(id) as unknown as {
      reject: () => void;
    };
    session.reject();
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

const checkSession = async (
  id: string,
  StreamPath: string,
  args: Record<string, unknown>
) => {
  const [, key, liveId] = StreamPath.split('/');
  const token = args.token as string;
  if (key !== 'live' || !liveId || !parseInt(liveId) || !token) {
    console.warn('invalid session', id, StreamPath, args);
    rejectSession(id);
    return;
  }

  const res = await jwk.verify(token);
  if (!res) {
    console.warn('invalid token');
    rejectSession(id);
    return;
  }

  if (res.type !== 'push' || res.liveId !== parseInt(liveId)) {
    console.warn('invalid live', res);
    rejectSession(id);
    return;
  }
};

const onConnect = (sessionId: string, liveId: number, token: string) => {
  console.log('onConnect');

  closeSocket(liveId);

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
};

nms.on('prePublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on prePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  void checkSession(id, StreamPath, args as Record<string, unknown>);
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on postPublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  void (async () => {
    await checkSession(id, StreamPath, args as Record<string, unknown>);

    const [, , liveId] = StreamPath.split('/');
    const token = (args as Record<string, unknown>).token as string;

    onConnect(id, parseInt(liveId), token);
  });
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on donePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  const [, , liveId] = StreamPath.split('/');
  // todo: required authentication?
  closeSocket(parseInt(liveId));
});
