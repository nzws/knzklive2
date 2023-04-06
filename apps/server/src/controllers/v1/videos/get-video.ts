import { Methods } from 'api-types/api/v1/videos/_liveId@number';
import { liveRecordings, lives } from '../../../models';
import { jwtEdge } from '../../../services/jwt';
import { baseVideoStream } from '../../../utils/constants';
import { APIRoute, LiveState } from '../../../utils/types';
import { LiveRecordingStatus } from '@prisma/client';
import { liveStreamProgresses } from '../../../models';
import { VideoWatchingLogCache } from '../../../services/redis/video-watching-log-cache';

type Response = Methods['get']['resBody'];

export const getV1Video: APIRoute<
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
  if (!live.isRecording) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'recording_not_found'
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
  const recording = await liveRecordings.get(live.id);
  const timestamps = await liveStreamProgresses.getList(live.id);
  if (!recording) {
    ctx.status = 404;
    ctx.body = {
      errorCode: 'recording_not_found'
    };
    return;
  }

  const hqUrl = `${baseVideoStream}/static/${live.id}_${live.watchToken}/hq/index.m3u8?token=${token}`;
  const isCacheDeleted =
    recording?.cacheStatus === LiveRecordingStatus.Deleted ||
    recording?.cacheStatus === LiveRecordingStatus.Failed ||
    recording?.cacheStatus === LiveRecordingStatus.NotFound;
  const isOriginalDeleted =
    recording?.originalStatus === LiveRecordingStatus.Deleted ||
    recording?.originalStatus === LiveRecordingStatus.Failed ||
    recording?.originalStatus === LiveRecordingStatus.NotFound;

  const todayCount = await new VideoWatchingLogCache(live.id).getActiveCount();
  const watchCount = recording.watchCount + todayCount;

  if (timestamps.some(timestamp => timestamp.endedAt === null)) {
    ctx.status = 500;
    ctx.body = {
      errorCode: 'internal_server_error',
      message: '予期せぬタイムスタンプの欠落'
    };
    return;
  }

  ctx.body = {
    url: {
      hlsHq:
        // todo: HQ以外がわからないので要修正
        recording?.cacheStatus === LiveRecordingStatus.Completed
          ? hqUrl
          : undefined
    },
    isCacheDeleted,
    isOriginalDeleted,
    watchCount,
    timestamps: timestamps
      .filter(x => x.endedAt)
      .map(timestamp => ({
        startedAt: timestamp.startedAt.toISOString(),
        endedAt: timestamp.endedAt?.toISOString() ?? ''
      }))
  };
};
