import { LiveStatus } from '@prisma/client';
import { JSONSchemaType } from 'ajv';
import { Methods } from 'api-types/api/v1/streams/_liveId@number/action';
import { lives } from '../../../models';
import { pubsub } from '../../../redis/pubsub/client';
import { getPushKey } from '../../../redis/pubsub/keys';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { validateWithType } from '../../../utils/validate';

type Request = Methods['post']['reqBody'];
type Response = Methods['post']['resBody'];

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
    if (ctx.state.live.status !== LiveStatus.Ready) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信のステータスが Ready ではありません'
      };
      return;
    }

    await lives.update({
      where: {
        id: ctx.state.live.id
      },
      data: {
        startedAt: new Date(),
        status: LiveStatus.Live
      }
    });
  } else if (body.command === 'end') {
    if (ctx.state.live.status === LiveStatus.Ended) {
      ctx.status = 400;
      ctx.body = {
        errorCode: 'invalid_request',
        message: '配信は終了済みです'
      };
      return;
    }

    await lives.update({
      where: {
        id: ctx.state.live.id
      },
      data: {
        endedAt: new Date(),
        status: LiveStatus.Ended
      }
    });
    await pubsub.publish(
      'update:hashtag',
      JSON.stringify({
        type: 'add',
        liveId: ctx.state.live.id
      })
    );

    await pubsub.publish(
      getPushKey(ctx.state.live.id),
      JSON.stringify({
        action: 'end',
        liveId: ctx.state.live.id
      })
    );
  }

  ctx.body = {
    success: true
  };
};
