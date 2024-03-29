import { Methods } from 'api-types/api/v1/videos/_liveId@number';
import { liveRecordings, lives } from '../../../models';
import { jwtEdge } from '../../../services/jwt';
import { baseVideoPlay } from '../../../utils/constants';
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

  const isAccessible = await lives.isAccessibleInformationByUser(
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

  const hqUrl = `${baseVideoPlay}/static/${live.id}_${live.watchToken}/hq/index.m3u8?token=${token}`;
  const isCacheDeleted =
    recording?.cacheHqStatus === LiveRecordingStatus.Deleted ||
    recording?.cacheHqStatus === LiveRecordingStatus.Failed;
  // ) && (recording?.cacheLqStatus === LiveRecordingStatus.Deleted ...)
  const isOriginalDeleted =
    recording?.originalStatus === LiveRecordingStatus.Deleted ||
    recording?.originalStatus === LiveRecordingStatus.Failed ||
    recording?.originalStatus === LiveRecordingStatus.NotFound;

  const todayCount = await new VideoWatchingLogCache(live.id).getActiveCount();
  const watchCount = (recording?.watchCount || 0) + todayCount;

  const isTimestampInProgress = timestamps.some(
    timestamp => timestamp.endedAt === null
  );

  // 最初のタイムスタンプは配信開始前の正確なデータが入っているので workaround
  if (live.startedAt) {
    timestamps[0].startedAt = live.startedAt;
  }

  ctx.body = {
    url: {
      hlsHq:
        recording?.cacheHqStatus === LiveRecordingStatus.Completed
          ? hqUrl
          : undefined
    },
    isCacheDeleted,
    isOriginalDeleted,
    watchCount,
    timestamps: isTimestampInProgress
      ? undefined
      : (timestamps as Timestamp[]).map(timestamp => ({
          startedAt: timestamp.startedAt.toISOString(),
          endedAt: timestamp.endedAt.toISOString(),
          duration: Math.floor(
            (timestamp.endedAt.getTime() - timestamp.startedAt.getTime()) / 1000
          )
        }))
  };
};

type Timestamp = {
  startedAt: Date;
  endedAt: Date;
};
