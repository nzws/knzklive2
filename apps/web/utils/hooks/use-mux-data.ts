// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/mux-embed/dist/types/mux-embed.d.ts"/>

import * as React from 'react';
import type Mux from 'mux-embed';

const muxEnv = process.env.NEXT_PUBLIC_MUX_DATA_ENV;

let muxInterface: typeof Mux | undefined;

export function useMuxData(
  element: React.RefObject<HTMLMediaElement>,
  liveId: number | undefined,
  liveTitle: string | undefined,
  userId: number | undefined,
  playType: string | undefined
) {
  React.useEffect(() => {
    const media = element.current;
    if (!media || !liveId || !liveTitle || !playType || !muxEnv) {
      return;
    }

    void (async () => {
      try {
        const mux = muxInterface || (await import('mux-embed')).default;
        muxInterface = mux;

        const initTime = mux.utils.now();
        mux.monitor(media, {
          debug: process.env.NODE_ENV === 'development',
          data: {
            env_key: muxEnv,
            player_init_time: initTime,
            viewer_user_id: userId?.toString(),
            video_id: liveId.toString(),
            video_title: liveTitle,
            video_is_live: true,
            video_encoding_variant: playType,
            video_stream_type: 'live',
            video_content_type: 'video'
          }
        });
      } catch (error) {
        console.error('Mux error:', error);
      }
    })();

    return () => {
      try {
        if (!muxInterface) {
          throw new Error('Mux is not initialized');
        }
        muxInterface.destroyMonitor(media);
      } catch (error) {
        console.error('Mux error:', error);
      }
    };
  }, [element, liveId, liveTitle, playType, userId]);
}
