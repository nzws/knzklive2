import { PlaybackTimestamp } from 'api-types/api/v1/videos/_liveId@number';
import { useComments } from './api/use-comments';
import { useMemo } from 'react';

export const usePlaybackComments = (
  liveId: number,
  seek: number,
  durations?: PlaybackTimestamp[]
) => {
  const [comments] = useComments(liveId);

  const virtualTimestamp = useMemo(() => {
    if (!durations?.length) return 0;

    let seeked = 0;
    let currentDuration = durations[0];
    for (const duration of durations) {
      if (seeked + duration.duration >= seek) {
        currentDuration = duration;
        break;
      }
      seeked += duration.duration;
    }
    const currentDurationSeek = seek - seeked;
    console.log(currentDurationSeek);
    const currentStart = new Date(currentDuration.startedAt).getTime();

    return currentStart + currentDurationSeek * 1000;
  }, [seek, durations]);

  const currentComments = useMemo(
    () =>
      comments?.filter(
        comment => new Date(comment.createdAt).getTime() <= virtualTimestamp
      ),
    [comments, virtualTimestamp]
  );

  return [currentComments] as const;
};
