import { useCallback, useEffect, useRef, useState } from 'react';
import { client } from '~/utils/api/client';
import { useAuth } from '../use-auth';
import { useAPIError } from './use-api-error';

export const usePushViaBrowser = (liveId?: number) => {
  const { token } = useAuth();
  const [isConnectingWs, setIsConnectingWs] = useState(false);
  const [isConnectedWs, setIsConnectedWs] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(true);
  const webSocketRef = useRef<WebSocket>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [audioStream, setAudioStream] = useState<MediaStream>();
  const [videoStream, setVideoStream] = useState<MediaStream>();
  const [websocketError, setWebsocketError] = useState<unknown>();
  const requestConnectingRef = useRef(false);
  useAPIError(websocketError);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const disconnect = useCallback(() => {
    requestConnectingRef.current = false;
    try {
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = undefined;
      }
    } catch (e) {
      console.warn(e);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const getPushUrl = useCallback(async () => {
    if (!liveId || !token) {
      throw new Error('liveId/token is required');
    }

    const { body } = await client.v1.streams._liveId(liveId).url.get({
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return body.websocket.url;
  }, [liveId, token]);

  const connect = useCallback(async () => {
    disconnect();
    if (!liveId) {
      return;
    }

    try {
      const url = await getPushUrl();
      const ws = new WebSocket(url);
      webSocketRef.current = ws;
      requestConnectingRef.current = true;
      setIsConnectingWs(true);

      ws.onopen = () => {
        console.log('open');
        setIsConnectingWs(false);
      };

      ws.onmessage = e => {
        if (!e.data) {
          return;
        }

        const data = JSON.parse(e.data as string) as {
          error?: string;
          type?: 'ready';
        };
        if ('error' in data) {
          setWebsocketError(data?.error);
          requestConnectingRef.current = false;
          return;
        }
        if (data.type === 'ready') {
          setIsConnectedWs(true);
          return;
        }
      };

      ws.onclose = () => {
        console.log('close');
        setIsConnectingWs(false);
        setIsConnectedWs(false);
        webSocketRef.current = undefined;
        if (requestConnectingRef.current) {
          timeoutRef.current = setTimeout(() => void connect(), 1000);
        }
      };
    } catch (e) {
      console.warn(e);
      setError(e);
    }
  }, [liveId, disconnect, getPushUrl]);

  useEffect(() => {
    if (isVoiceMuted) {
      return;
    }

    let audioStream: MediaStream;
    void (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          audio: true
        });

        audioStream = new MediaStream();
        const audioTracks = media.getAudioTracks();
        audioTracks.forEach(track => {
          audioStream.addTrack(track);
        });
        setAudioStream(audioStream);
      } catch (e) {
        console.error(e);
        setError(e);
        setIsVoiceMuted(true);
      }
    })();

    return () => {
      audioStream?.getTracks().forEach(track => track.stop());
      setAudioStream(undefined);
    };
  }, [isVoiceMuted]);

  useEffect(() => {
    /*
    let videoStream: MediaStream;
    void (async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: true
        });

        videoStream = new MediaStream();
        const tracks = media.getVideoTracks();
        tracks.forEach(track => {
          videoStream.addTrack(track);
        });
        setVideoStream(videoStream);
      } catch (e) {
        console.error(e);
        setError(e);
      }
    })();

    return () => {
      videoStream?.getTracks().forEach(track => track.stop());
    };
    */
  }, []);

  useEffect(() => {
    if ((!audioStream && !videoStream) || !isConnectedWs) {
      return;
    }

    let recorder: MediaRecorder | undefined;

    try {
      const stream = new MediaStream();

      if (audioStream) {
        audioStream.getTracks().forEach(track => {
          stream.addTrack(track);
        });
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => {
          stream.addTrack(track);
        });
      }

      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = event => {
        if (event.data.size > 0) {
          webSocketRef.current?.send(event.data);
        }
      };

      recorder.start(1000 / 30);
    } catch (e) {
      console.error(e);
      setError(e);
    }

    return () => {
      try {
        recorder?.stop();
      } catch (e) {
        console.warn(e);
      }
    };
  }, [audioStream, videoStream, isConnectedWs]);

  return {
    isConnectingWs,
    isConnectedWs,
    isVoiceMuted,
    setIsVoiceMuted,
    connect,
    disconnect
  } as const;
};
