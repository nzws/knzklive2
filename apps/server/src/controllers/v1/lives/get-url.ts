import { Methods } from 'api-types/api/v1/lives/_liveId@number/url';
import { liveRecordings, lives } from '../../../models';
import { jwtEdge } from '../../../services/jwt';
import { basePushStream, baseVideoStream } from '../../../utils/constants';
import { APIRoute, LiveState } from '../../../utils/types';
import { LiveRecordingStatus } from '@prisma/client';

type Response = Methods['get']['resBody'];

export const getV1LivesUrl: APIRoute<
  never,
  never,
  never,
  Response,
  LiveState
> = async ctx => {
  const live = ctx.state.live;
  if (!live.watchToken) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'live_not_found'
    };
    return;
  }

  const isAccessible = await lives.isAccessibleStreamByUser(
    live,
    ctx.state.userId
  );
  if (!isAccessible) {
    ctx.status = 403;
    ctx.body = {
      errorCode: 'forbidden_live'
    };
    return;
  }

  const token = await jwtEdge.generateTokenAsStream(live.id);

  if (!live.endedAt) {
    ctx.body = {
      live: {
        flv: `${basePushStream}/streaming/live/${live.id}_${live.watchToken}.flv?token=${token}`,
        hlsHq: `${basePushStream}/static/live/${live.id}_${live.watchToken}/source/stream.m3u8?token=${token}`,
        hlsLq: `${basePushStream}/static/live/${live.id}_${live.watchToken}/low/stream.m3u8?token=${token}`,
        audio: `${basePushStream}/static/live/${live.id}_${live.watchToken}/audio/stream.m3u8?token=${token}`
      }
    };
    return;
  }

  if (live.isRecording) {
    const recording = await liveRecordings.get(live.id);
    if (
      recording?.originalStatus === LiveRecordingStatus.Deleted ||
      recording?.originalStatus === LiveRecordingStatus.Failed ||
      recording?.originalStatus === LiveRecordingStatus.NotFound
    ) {
      ctx.status = 404;
      ctx.body = {
        errorCode: 'recording_not_found'
      };
      return;
    }

    if (
      recording?.cacheStatus === LiveRecordingStatus.Deleted ||
      recording?.cacheStatus === LiveRecordingStatus.Failed ||
      recording?.cacheStatus === LiveRecordingStatus.NotFound
    ) {
      ctx.status = 404;
      ctx.body = {
        errorCode: 'recording_cache_not_found'
      };
      return;
    }

    const hqUrl = `${baseVideoStream}/static/${live.id}_${live.watchToken}/hq/index.m3u8?token=${token}`;

    ctx.body = {
      playback: {
        hlsHq:
          // todo: HQ以外がわからないので要修正
          recording?.cacheStatus === LiveRecordingStatus.Completed
            ? hqUrl
            : undefined
      }
    };
    return;
  }

  ctx.status = 400;
  ctx.body = {
    errorCode: 'live_already_ended'
  };
};
