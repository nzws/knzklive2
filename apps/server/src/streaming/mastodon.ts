import striptags from 'striptags';
import { WebSocket } from 'ws';
import { comments, lives, users } from '../models';
import { pubsub } from '../redis/pubsub/client';

const token = process.env.MASTODON_ACCESS_TOKEN || '';
const domain = process.env.MASTODON_DOMAIN || '';

type Hashtag = {
  hashtag: string;
  liveId: number;
};

export class MastodonStreaming {
  ws?: WebSocket;
  hashtags: Hashtag[] = [];

  connect() {
    try {
      if (this.ws) {
        this.ws.close();
      }
    } catch (e) {
      console.warn(e);
    }

    try {
      const ws = new WebSocket(
        `wss://${domain}/api/v1/streaming/?access_token=${token}&stream=public`
      );
      this.ws = ws;

      ws.on('open', () => {
        console.log('mastodon streaming connected');
      });

      ws.on('message', message => {
        try {
          void this.handleMessage(message.toString());
        } catch (e) {
          console.warn(e);
        }
      });

      ws.on('close', () => {
        console.log('websocket closed');

        setTimeout(() => {
          this.connect();
        }, 1000);
      });
    } catch (e) {
      console.warn(e);

      setTimeout(() => {
        this.connect();
      }, 1000);
    }
  }

  async prepareHashtag() {
    const live = await lives.getAliveAll();
    this.hashtags = live
      .filter(({ hashtag }) => hashtag)
      .map(l => ({
        hashtag: l.hashtag?.toLowerCase() || '',
        liveId: l.id
      }));

    const handle = {
      event: 'update:hashtag',
      callback: (message: string) => {
        const data = JSON.parse(message) as {
          type: 'add' | 'remove';
          hashtag?: string;
          liveId: number;
        };

        if (data.type === 'add') {
          if (!data.hashtag) {
            console.warn('hashtag is empty');
            return;
          }
          this.hashtags.push({
            hashtag: data.hashtag.toLowerCase(),
            liveId: data.liveId
          });
        } else {
          this.hashtags = this.hashtags.filter(
            hashtag => hashtag.liveId !== data.liveId
          );
        }
      }
    };

    await pubsub.on(handle);
  }

  private async handleMessage(message: string) {
    const data = JSON.parse(message.toString()) as {
      event: string;
      payload: string;
    };
    if (data.event === 'update') {
      const payload = JSON.parse(data.payload) as {
        id: string;
        content: string;
        account: {
          acct: string;
          username: string;
          display_name: string;
        };
        tags?: {
          name: string;
          url: string;
        }[];
        url: string;
      };
      if (!payload.tags?.length) {
        return;
      }

      const hashtags = payload.tags.map(tag => tag.name.toLowerCase());
      const liveIds = this.hashtags
        .filter(hashtag => hashtags.includes(hashtag.hashtag))
        .map(hashtag => hashtag.liveId);

      if (liveIds.length > 0) {
        const acct =
          payload.account.acct === payload.account.username
            ? `${payload.account.acct}@${domain}`
            : payload.account.acct;

        const user = await users.getOrCreateForRemote(
          payload.account.display_name,
          acct.toLowerCase()
        );
        const content = striptags(payload.content);

        await Promise.all(
          liveIds.map(liveId =>
            comments.createViaRemote(
              user.id,
              liveId,
              content,
              payload.url,
              payload.id
            )
          )
        );
      }
    } else if (data.event === 'delete') {
      await comments.markAsDeleteBySourceId(data.payload);
    }
  }
}
