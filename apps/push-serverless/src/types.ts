// https://ossrs.net/lts/en-us/docs/v4/doc/http-callback#http-callback-events
export type SRSPublishCallback = {
  action: 'on_publish';
  client_id: string;
  ip: string;
  vhost: string;
  app: string;
  stream: string;
  tcUrl: string;
  param: string;
  stream_id: string;
};

export type SRSUnPublishCallback = {
  action: 'on_unpublish';
  client_id: string;
  ip: string;
  vhost: string;
  app: string;
  stream: string;
  tcUrl: string;
  param: string;
};

export type SRSCallback = {
  action: string;
  client_id: string;
  ip: string;
  vhost: string;
  app: string;
  stream: string;
  tcUrl: string;
  param: string;
};
