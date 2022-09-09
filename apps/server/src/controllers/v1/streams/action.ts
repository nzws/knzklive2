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
    await lives.update({
      where: {
        id: ctx.state.live.id
      },
      data: {
        startedAt: new Date()
      }
    });
  } else if (body.command === 'end') {
    await lives.update({
      where: {
        id: ctx.state.live.id
      },
      data: {
        endedAt: new Date()
      }
    });
    await pubsub.publish(
      getPushKey(ctx.state.live.id),
      JSON.stringify({
        action: 'end'
      })
    );
  }

  ctx.body = {
    success: true
  };
};
