import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/_liveId@number/action';
import { lives } from '../../../models';
import { LiveWatching } from '../../../redis/live-watching';
import { pubsub } from '../../../redis/pubsub/client';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';
import { pushApi } from '../../../services/push-api';
import { basePushStream, serverToken } from '../../../utils/constants';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

const liveWatching = new LiveWatching();

const reqBodySchema: JSONSchemaType<Request> = {
  type: 'object',
  properties: {
    command: {
      type: 'string',
      enum: ['publish', 'end']
    }
  },
  required: ['command'],
  additionalProperties: false
};

export const postV1StreamsAction: APIRoute<
  never,
  never,
  Request,
  Response,
  UserState & LiveState
> = async ctx => {
  if (!validateWithType(reqBodySchema, ctx.request.body)) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request'
    };
    return;
  }
  const body = ctx.request.body;

  if (body.command === 'publish') {
    if (ctx.state.live.startedAt) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信は開始済みです'
      };
      return;
    }

    await lives.startLive(ctx.state.live);
  } else if (body.command === 'end') {
    if (ctx.state.live.endedAt) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信は終了済みです'
      };
      return;
    }

    const { sum } = await liveWatching.get(ctx.state.live.id);
    await lives.endLive(ctx.state.live, sum);

    await pubsub.publish(
      'update:hashtag',
      JSON.stringify({
        type: 'add',
        liveId: ctx.state.live.id
      })
    );

    await liveWatching.stopLive(ctx.state.live.id);

    try {
      await pushApi(basePushStream).api.externals.v1.action.$post({
        body: {
          liveId: ctx.state.live.id,
          action: 'end',
          serverToken
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  ctx.body = {
    success: true
  };
};
