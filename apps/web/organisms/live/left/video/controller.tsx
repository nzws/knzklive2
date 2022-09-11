import {
  Button,
  ButtonGroup,
  Flex,
  Spacer,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, RefObject, useEffect } from 'react';
import { useLocalStorage } from 'react-use';
import { FiMaximize, FiVolume, FiVolumeX } from 'react-icons/fi';

type Props = {
  onLive: () => void;
  videoRef: RefObject<HTMLVideoElement>;
};

export const Controller: FC<Props> = ({ onLive, videoRef }) => {
  const [isMuted, setIsMuted] = useLocalStorage(
    'knzklive-player-is-muted',
    false
  );
  const [volume, setVolume] = useLocalStorage('knzklive-player-volume', 60);
  const isDesktop = useBreakpointValue(
    { base: false, xl: true },
    { fallback: 'xl' }
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.muted = isMuted || false;
    video.volume = (volume || 0) / 100;
  }, [isMuted, volume, videoRef]);

  return (
    <Container>
      <Flex minWidth="max-content" alignItems="center" gap="2" p={2}>
        <Button variant="ghost" onClick={onLive} size="sm">
          LIVE
        </Button>

        <Button
          variant="ghost"
          onClick={() => setIsMuted(prev => !prev)}
          size="sm"
        >
          {isMuted ? <FiVolumeX /> : <FiVolume />}
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
