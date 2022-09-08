import Redis from 'ioredis';
import { redisUrl } from '../_client';

const pubClient = new Redis(redisUrl);
const subClient = new Redis(redisUrl);

type Callback = (message: string) => void;
type Cb = {
  callback: Callback;
  event: string;
};

class PubSub {
  private callbacks: Cb[] = [];
  private subscribeEvents: string[] = [];

  constructor() {
    subClient.on('message', (channelName, message) => {
      this.callbacks.forEach(cb => {
        if (cb.event === channelName) {
          cb.callback(message as string);
        }
      });
    });
  }

  publish(channel: string, message: string) {
    return pubClient.publish(channel, message);
  }

  protected subscribe(channel: string) {
    if (!this.subscribeEvents.includes(channel)) {
      this.subscribeEvents.push(channel);
      return subClient.subscribe(channel);
    }
  }

  async on(data: Cb) {
    await this.subscribe(data.event);
    this.callbacks.push(data);
  }

  off(data: Cb) {
    this.callbacks = this.callbacks.filter(cb => cb !== data);
  }
}

export const pubsub = new PubSub();
