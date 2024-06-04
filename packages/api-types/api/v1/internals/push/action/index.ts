export type Event =
  | 'stream:start'
  | 'stream:stop'
  | 'record:processing'
  | 'record:done'
  | 'record:failed'
  | 'stream:heartbeat';

export type Methods = {
  post: {
    reqBody: {
      liveId: number;
      action: Event;
      serverToken: string;
      // record:done
      recordingKey?: string;
      fileSize?: string;
      // stream:heartbeat
      stats?: {
        kbps: {
          recv_30s: number;
          send_30s: number;
        };
        video?: {
          codec: string;
          profile: string;
          level: string;
          width: number;
          height: number;
        } | null;
        audio?: {
          codec: string;
          sample_rate: number;
          channel: number;
          profile: string;
        } | null;
      };
    };

    resBody: {
      success: boolean;
    };
  };
};
