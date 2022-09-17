import {
  Button,
  Flex,
  Spacer,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useBreakpointValue,
  Fade,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, RefObject, useEffect, useState } from 'react';
import {
  FiChevronsUp,
  FiMaximize,
  FiRefreshCw,
  FiSettings,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';
import { FormattedMessage, useIntl } from 'react-intl';
import { PlayType } from '~/utils/hooks/use-video-stream';

type Props = {
  onLive: () => void;
  onReload: () => void;
  onToggleContainerSize: () => void;
  onToggleMaximize: () => void;
  videoRef: RefObject<HTMLVideoElement>;
  isStreamer?: boolean;
  show: boolean;
  latency: number;
  playType: PlayType;
  onChangePlayType: (type: PlayType) => void;
};

export const Controller: FC<Props> = ({
  onLive,
  onReload,
  onToggleContainerSize,
  onToggleMaximize,
  isStreamer,
  videoRef,
  show,
  latency,
  playType,
  onChangePlayType
}) => {
  const intl = useIntl();
  const [isMuted, setIsMuted] = useState<boolean>();
  const [volume, setVolume] = useState<number>();
  const isDesktop = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'lg' }
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
    const volume = window.localStorage.getItem('live-volume') || '100';

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
          <Tooltip
            label={intl.formatMessage({ id: 'live.player.seek-latest' })}
          >
            <Button variant="ghost" onClick={onLive} size="sm">
              {latency === -1 ? 'BUFFERING' : `LIVE (${latency}s)`}
            </Button>
          </Tooltip>

          <Tooltip label={intl.formatMessage({ id: 'live.player.reload' })}>
            <Button variant="ghost" onClick={onReload} size="sm">
              <FiRefreshCw />
            </Button>
          </Tooltip>

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

          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm">
              <FiSettings />
            </MenuButton>
            <MenuList>
              <MenuOptionGroup
                title={intl.formatMessage({ id: 'live.player.settings.type' })}
                value={playType}
                onChange={e => onChangePlayType(e as PlayType)}
                type="radio"
              >
                <MenuItemOption value="flv">
                  <FormattedMessage id="live.player.settings.type.flv" />
                </MenuItemOption>
                <MenuItemOption value="hls">
                  <FormattedMessage id="live.player.settings.type.hls" />
                </MenuItemOption>
                {/*
                <MenuItemOption value="mp3">
                  <FormattedMessage id="live.player.settings.type.mp3" />
                </MenuItemOption>
                */}
              </MenuOptionGroup>
            </MenuList>
          </Menu>

          {isDesktop && (
            <Tooltip label={intl.formatMessage({ id: 'live.player.wide' })}>
              <Button variant="ghost" size="sm" onClick={onToggleContainerSize}>
                <FiChevronsUp />
              </Button>
            </Tooltip>
          )}

          <Tooltip label={intl.formatMessage({ id: 'live.player.maximize' })}>
            <Button variant="ghost" size="sm" onClick={onToggleMaximize}>
              <FiMaximize />
            </Button>
          </Tooltip>
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
