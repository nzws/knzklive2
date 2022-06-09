import Redis from 'ioredis';
import { redisUrl } from '../_client';

const pubClient = new Redis(redisUrl);
const subClient = new Redis(redisUrl);

type Callback = (message: string) => void;
type Cb = {
  callback: Callback;
  event?: string;
  firehoseEvent?: string;
};

class PubSub {
  private callbacks: Cb[] = [];
  private subscribeEvents: string[] = [];

  constructor() {
    subClient.on('message', (channelName: string, message) => {
      this.callbacks.forEach(cb => {
        if (
          (cb.event && cb.event === channelName) ||
          (cb.firehoseEvent && channelName.startsWith(cb.firehoseEvent))
        ) {
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
