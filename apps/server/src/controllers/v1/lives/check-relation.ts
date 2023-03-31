import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/lives/_liveId@number/check-relation';
import { lives, users } from '../../../models';
import { AuthMastodon } from '../../../services/auth-providers/mastodon';
import { AuthMisskey } from '../../../services/auth-providers/misskey';
import { RelationCache } from '../../../services/redis/relation-cache';
import { InternalUserIdCache } from '../../../services/redis/internal-user-id-cache';
import { APIRoute } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    mastodonToken: {
      type: 'string',
      minLength: 1,
      nullable: true
    },
    misskeyToken: {
      type: 'string',
      minLength: 1,
      nullable: true
    }
  },
  additionalProperties: false
};

export const postV1LivesCheckRelation: APIRoute<
  'liveId',
  never,
  Request,
  Response
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }

  const liveId = parseInt(
    (ctx.params as Record<string, string>).liveId || '',
    10
  );
  if (!liveId || isNaN(liveId) || liveId <= 0) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const live = await lives.get(liveId);
  if (!live) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const userId = ctx.state.userId;
  const isAccessible = await lives.isAccessibleInformationByUser(live, userId);
  // 現時点で閲覧可能な場合は特に確認しない
  if (isAccessible) {
    ctx.body = {
      success: true
    };
    return;
  }

  // 未認証時はそもそも検証できない
  if (!userId) {
    ctx.body = {
      success: false
    };
    return;
  }

  const relationCache = new RelationCache(live.userId);
  // キャッシュがあるが、isAccessible が false の場合は多分リレーションがない
  if (await relationCache.isFresh(userId)) {
    ctx.body = {
      success: false
    };
    return;
  }

  const user = await users.get(userId);
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      errorCode: 'user_not_found'
    };
    return;
  }

  const streamer = await users.get(live.userId);
  if (!streamer?.account) {
    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error'
    };
    return;
  }

  try {
    const mastodonToken = ctx.request.body.mastodonToken;
    const misskeyToken = ctx.request.body.misskeyToken;
    const userIdCache = new InternalUserIdCache(streamer.id);

    if (mastodonToken) {
      const domain = user.account.split('@')[1];
      const auth = new AuthMastodon(domain);

      // リレーションデータを取得するために、KnzkLive ではなく各サーバーでそれぞれ採番された配信者の id を取得する
      const streamerInternalId =
        (await userIdCache.get(domain)) ||
        (await auth.getInternalUserIdFromAcct(mastodonToken, streamer.account));
      await userIdCache.set(domain, streamerInternalId);

      const relation = await auth.getRelation(
        mastodonToken,
        streamerInternalId
      );
      await relationCache.set(user.id, relation);
    } else if (misskeyToken) {
      const domain = user.account.split('@')[1];
      const auth = new AuthMisskey(domain);

      const streamerInternalId =
        (await userIdCache.get(domain)) ||
        (await auth.getInternalUserIdFromAcct(misskeyToken, streamer.account));
      await userIdCache.set(domain, streamerInternalId);

      const relation = await auth.getRelation(misskeyToken, streamerInternalId);
      await relationCache.set(user.id, relation);
    }
  } catch (e) {
    // サーバー上に配信者が認知されていなければ API からエラーが返ってくる
    // が、認知されていない=必然的にリレーションが無いはずなので、無視する
    console.warn(e);
  }

  ctx.body = {
    success: await lives.isAccessibleInformationByUser(live, user.id)
  };
  return;
};
