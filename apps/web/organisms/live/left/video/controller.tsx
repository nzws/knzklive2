import {
  Button,
  ButtonGroup,
  Flex,
  Spacer,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue,
  Fade
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, RefObject, useEffect, useState } from 'react';
import { FiMaximize, FiVolume2, FiVolumeX } from 'react-icons/fi';

type Props = {
  onLive: () => void;
  videoRef: RefObject<HTMLVideoElement>;
  isStreamer?: boolean;
  show: boolean;
  latency: number;
};

export const Controller: FC<Props> = ({
  onLive,
  isStreamer,
  videoRef,
  show,
  latency
}) => {
  const [isMuted, setIsMuted] = useState<boolean>();
  const [volume, setVolume] = useState<number>();
  const isDesktop = useBreakpointValue(
    { base: false, xl: true },
    { fallback: 'xl' }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = isMuted === undefined ? true : isMuted || false;
    video.volume = volume === undefined ? 0 : (volume || 0) / 100;

    if (isMuted !== undefined) {
      window.localStorage.setItem('live-volume', String(volume));
    }
    if (!isStreamer && volume !== undefined) {
      window.localStorage.setItem('live-mute', String(isMuted));
    }
  }, [isMuted, volume, isStreamer, videoRef]);

  useEffect(() => {
    if (isStreamer === undefined) {
      return;
    }

    const mute = window.localStorage.getItem('live-mute') || 'false';
    const volume = window.localStorage.getItem('live-volume') || '60';

    if (mute || isStreamer) {
      setIsMuted(isStreamer || mute === 'true');
    }
    if (volume) {
      setVolume(Number(volume));
    }
  }, [isStreamer]);

  return (
    <Fade in={show}>
      <Container>
        <Flex minWidth="max-content" alignItems="center" gap="2" p={2}>
          <Button variant="ghost" onClick={onLive} size="sm">
            {latency === -1 ? 'BUFFERING' : `LIVE (${latency}s)`}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setIsMuted(prev => !prev)}
            size="sm"
          >
            {isMuted ? <FiVolumeX /> : <FiVolume2 />}
          </Button>

          {isDesktop && (
            <Slider
              aria-label="volume"
              value={volume}
              onChange={e => setVolume(e)}
              size="sm"
              maxW="40%"
              width="150px"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          )}

          <Spacer />

          <ButtonGroup gap="2">
            <Button variant="ghost" size="sm">
              <FiMaximize />
            </Button>
          </ButtonGroup>
        </Flex>
      </Container>
    </Fade>
  );
};

const Container = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  height: 10%;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;
