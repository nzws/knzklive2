import Redis from 'ioredis';
import { redisUrl, family } from '../_client';

const pubClient = new Redis(redisUrl, {
  family
});
const subClient = new Redis(redisUrl, {
  family
});

type Callback = (message: string) => void;
type Cb = {
  callback: Callback;
  event?: string;
};

class PubSub {
  private callbacks: Cb[] = [];
  private subscribeEvents: string[] = [];

  constructor() {
    subClient.on('message', (channelName: string, message) => {
      this.callbacks.forEach(cb => {
        if (cb.event && cb.event === channelName) {
          cb.callback(message as string);
        }
      });
    });
  }

  publish(channel: string, message: string) {
    return pubClient.publish(channel, message);
  }

  subscribe(channel: string) {
    if (!this.subscribeEvents.includes(channel)) {
      this.subscribeEvents.push(channel);
      return subClient.subscribe(channel);
    }
  }

  async on(data: Cb) {
    if (data.event) {
      await this.subscribe(data.event);
    }
    this.callbacks.push(data);
  }

  off(data: Cb) {
    this.callbacks = this.callbacks.filter(cb => cb !== data);
  }
}

export const pubsub = new PubSub();
