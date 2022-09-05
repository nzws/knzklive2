import NodeMediaServer from 'node-media-server';
import WebSocket from 'ws';

const httpPort = parseInt(process.env.PORT || '8000', 10);

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

nms.on('postPublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on postPublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );

  const edge = new WebSocket('ws://localhost:8787/streaming/1/push');

  edge.on('open', () => {
    console.log('edge connected');

    const stream = new WebSocket(`ws://localhost:${httpPort}${StreamPath}`);

    stream.on('open', () => {
      console.log('WebSocket client connected');
    });

    stream.on('message', data => {
      edge.send(data);
    });

    stream.on('close', () => {
      console.log('WebSocket client disconnected');
      edge.close();
    });
  });

  edge.on('close', () => {
    console.log('edge disconnected');
  });
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log(
    '[NodeEvent on donePublish]',
    `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
  );
});
