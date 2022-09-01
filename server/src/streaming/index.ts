import { Server } from 'http';
import WebSocket, { VerifyClientCallbackAsync } from 'ws';

export class Streaming {
  private readonly websocket: WebSocket.Server;

  constructor(server: Server) {
    const ws = new WebSocket.Server({
      server,
      verifyClient
    });
    this.websocket = ws;
  }
}

const verifyClient: VerifyClientCallbackAsync = (info, callback) => {
  //
};
