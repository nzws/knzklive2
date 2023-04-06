import { Methods } from 'api-types/api/v1/streams/_liveId@number/recording';
import { liveRecordings } from '../../../models';
import { APIRoute, LiveState, UserState } from '../../../utils/types';
import { LiveRecordingStatus } from '@prisma/client';
import { webhookQueue } from '../../../services/queues/webhook';
import { videoApi } from '../../../services/video-api';
import { baseVideoStream, serverToken } from '../../../utils/constants';
import { VideoStorageClient } from '../../../services/storage/_client';

type Response = Methods['post']['resBody'];

export const postV1StreamsRecording: APIRoute<
  never,
  never,
  never,
  Response,
  UserState & LiveState
> = async ctx => {
  const live = ctx.state.live;
  const recording = await liveRecordings.get(ctx.state.live.id);
  if (
    !recording ||
    recording.originalStatus !== LiveRecordingStatus.Completed ||
    !recording.originalKey
  ) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'オリジナルデータが準備中か存在しません'
    };
    return;
  }

  if (!live.watchToken) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: 'watchTokenが存在しません'
    };
    return;
  }

  if (
    recording.cacheHqStatus === LiveRecordingStatus.Completed ||
    recording.cacheHqStatus === LiveRecordingStatus.Processing
    // || recording.cacheLqStatus === LiveRecordingStatus.Completed ...
  ) {
    ctx.status = 400;
    ctx.body = {
      errorCode: 'invalid_request',
      message: '録画は既にあるか準備中です'
    };
    return;
  }

  const downloadUrl = await new VideoStorageClient().getSignedDownloadUrl(
    recording.originalKey
  );

  await webhookQueue.add('system:video:publish', {
    url: videoApi(baseVideoStream).api.externals.v1.recording.publish.$path(),
    postBody: {
      liveId: live.id,
      watchToken: live.watchToken,
      serverToken,
      downloadUrl
    },
    timeout: 1000 * 60
  });

  ctx.body = {
    success: true
  };
};
