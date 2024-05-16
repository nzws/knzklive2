import striptags from 'striptags';
import { WebSocket } from 'ws';
import { comments, lives, users } from '../models';
import { pubsub } from '../services/redis/pubsub/client';

const token = process.env.MASTODON_ACCESS_TOKEN || '';
const mastodonDomain = process.env.MASTODON_DOMAIN || '';
const streamingDomain = process.env.MASTODON_STREAMING_DOMAIN || mastodonDomain;

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
        `wss://${streamingDomain}/api/v1/streaming/?access_token=${token}`
      );
      this.ws = ws;

      ws.on('open', () => {
        console.log('mastodon streaming connected');

        this.hashtags.forEach(({ hashtag }) => {
          this.subscribeHashtag(hashtag);
        });
      });

      ws.on('message', message => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          void this.handleMessage(message.toString());
        } catch (e) {
          console.warn(e);
        }
      });

      ws.on('close', () => {
        console.log('mastodon streaming closed');

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
    const currentHashtags = live
      .map(l => ({
        hashtag: l.hashtag?.toLowerCase() || '',
        liveId: l.id
      }))
      .filter(({ hashtag }) => hashtag);

    currentHashtags.forEach(hashtag => {
      this.addHashtag(hashtag.hashtag, hashtag.liveId);
    });

    const handle = {
      event: 'update:hashtag',
      callback: (message: string) => {
        const data = JSON.parse(message) as {
          type: 'add' | 'remove';
          hashtag: string;
          liveId: number;
        };

        if (data.type === 'add') {
          this.addHashtag(data.hashtag, data.liveId);
        } else {
          this.removeHashtag(data.hashtag, data.liveId);
        }
      }
    };

    await pubsub.on(handle);
  }

  private addHashtag(hashtag: string, liveId: number) {
    const _hashtag = hashtag.toLowerCase();
    const isAlreadySubscribed = this.hashtags.some(
      hashtag => hashtag.hashtag === _hashtag
    );

    this.hashtags.push({
      hashtag: _hashtag,
      liveId
    });

    if (!isAlreadySubscribed) {
      this.subscribeHashtag(_hashtag);
    }
  }

  private removeHashtag(hashtag: string, liveId: number) {
    const live = this.hashtags.find(hashtag => hashtag.liveId === liveId);

    if (live) {
      this.hashtags = this.hashtags.filter(
        hashtag => hashtag.liveId !== liveId
      );
    }

    const _hashtag = hashtag.toLowerCase();

    // 複数配信から同じタグでサブスクライブされる可能性があるので、全配信から消えたハッシュタグのみサブスクライブ解除する
    const isAlreadySubscribed = this.hashtags.some(
      hashtag => hashtag.hashtag === _hashtag
    );

    if (!isAlreadySubscribed) {
      this.unsubscribeHashtag(_hashtag);
    }
  }

  private subscribeHashtag(hashtag: string) {
    console.log(`Subscribe hashtag: ${hashtag}`);

    try {
      if (this.ws && this.ws.readyState === this.ws.OPEN) {
        this.ws?.send(
          JSON.stringify({
            type: 'subscribe',
            stream: 'hashtag',
            tag: hashtag
          })
        );
      }
    } catch (e) {
      console.warn(e);
    }
  }

  private unsubscribeHashtag(hashtag: string) {
    console.log(`Unsubscribe hashtag: ${hashtag}`);

    try {
      this.ws?.send(
        JSON.stringify({
          type: 'unsubscribe',
          stream: 'hashtag',
          tag: hashtag
        })
      );
    } catch (e) {
      console.warn(e);
    }
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
          display_name?: string;
          avatar_static?: string;
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
            ? `${payload.account.acct}@${mastodonDomain}`
            : payload.account.acct;

        const user = await users.getOrCreateForRemote(
          acct.toLowerCase(),
          payload.account.display_name,
          payload.account.avatar_static
        );
        const content = striptags(payload.content);

        await Promise.all(
          liveIds.map(liveId =>
            comments.createViaRemote(
              user,
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
