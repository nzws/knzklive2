const API_ENDPOINT = process.env.SRS_ENDPOINT || 'http://localhost:1985';

export const kickoffClient = async (id: string) => {
  await fetch(`${API_ENDPOINT}/api/v1/clients/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/** "streams": [
    {
      "id": "vid-ff500jr",
      "name": "10_628f27feff6be7187b295317f8d5fe81e20e524f7f57e581c9430d3b3eea06ada579f23ba03c78ea43bf6c64520db4d6",
      "vhost": "vid-8n5l812",
      "app": "live",
      "tcUrl": "rtmp://127.0.0.1/live",
      "url": "/live/10_628f27feff6be7187b295317f8d5fe81e20e524f7f57e581c9430d3b3eea06ada579f23ba03c78ea43bf6c64520db4d6",
      "live_ms": 1717517428337,
      "clients": 6,
      "frames": 7795,
      "send_bytes": 186135731,
      "recv_bytes": 44801527,
      "kbps": {
        "recv_30s": 2668,
        "send_30s": 10686
      },
      "publish": {
        "active": true,
        "cid": "69kaucce"
      },
      "video": {
        "codec": "H264",
        "profile": "High",
        "level": "Other",
        "width": 1920,
        "height": 1080
      },
      "audio": {
        "codec": "AAC",
        "sample_rate": 44100,
        "channel": 2,
        "profile": "LC"
      }
    }
  ]
 */
interface Stream {
  id: string;
  name: string;
  vhost: string;
  app: string;
  tcUrl: string;
  url: string;
  live_ms: number;
  clients: number;
  frames: number;
  send_bytes: number;
  recv_bytes: number;
  kbps: {
    recv_30s: number;
    send_30s: number;
  };
  publish: {
    active: boolean;
    cid: string;
  };
  video: {
    codec: string;
    profile: string;
    level: string;
    width: number;
    height: number;
  } | null;
  audio: {
    codec: string;
    sample_rate: number;
    channel: number;
    profile: string;
  } | null;
}

interface StreamsResponse {
  code: number;
  server: string;
  service: string;
  pid: string;
  streams: Stream[];
}

interface StreamResponse {
  code: number;
  server: string;
  service: string;
  pid: string;
  stream?: Stream;
}

export const getStreams = async () => {
  const res = await fetch(`${API_ENDPOINT}/api/v1/streams`);
  return res.json() as Promise<StreamsResponse>;
};

export const getStream = async (id: string) => {
  const res = await fetch(`${API_ENDPOINT}/api/v1/streams/${id}`);
  return res.json() as Promise<StreamResponse>;
};
