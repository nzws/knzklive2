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
  MenuOptionGroup,
  Badge,
  Text,
  Portal
} from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC, Fragment, RefObject, useEffect, useState } from 'react';
import {
  FiChevronsUp,
  FiMaximize,
  FiMessageCircle,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiVolume2,
  FiVolumeX
} from 'react-icons/fi';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  LivePlayType,
  PlayType,
  VideoPlayType
} from '~/utils/hooks/use-video-stream';
import { formatSeconds } from '~/utils/time';

type CommonProps = {
  onToggleContainerSize?: () => void;
  onToggleMaximize: () => void;
  videoRef: RefObject<HTMLVideoElement>;
  show: boolean;
};

type LiveProps = {
  isLive: true;
  onLive: () => void;
  onReload: () => void;
  isStreamer?: boolean;
  latency: number;
  playType: PlayType<'live'> | undefined;
  onChangePlayType: (type: PlayType<'live'>) => void;
  onChangeDanmaku: () => void;
};

type VideoProps = {
  isLive: false;
  onPlay: () => void;
  playType: PlayType<'video'> | undefined;
  onChangePlayType: (type: PlayType<'video'>) => void;
  seek: number;
  videoSeconds: number;
  onSeek: (seek: number) => void;
  onPause: () => void;
  isPlaying: boolean;
};

type Props = CommonProps & (LiveProps | VideoProps);

export const Controller: FC<Props> = props => {
  const intl = useIntl();
  const [isMuted, setIsMuted] = useState<boolean>();
  const [volume, setVolume] = useState<number>();
  const isDesktop = useBreakpointValue(
    { base: false, lg: true },
    { fallback: 'lg' }
  );

  const isLive = props.isLive;
  const forceMuteFirst = props.isLive ? props.isStreamer : false;

  useEffect(() => {
    const video = props.videoRef.current;
    if (!video) {
      return;
    }

    video.muted = isMuted === undefined ? true : isMuted || false;
    video.volume = volume === undefined ? 0 : (volume || 0) / 100;

    if (isMuted !== undefined) {
      window.localStorage.setItem('live-volume', String(volume));
    }
    if (forceMuteFirst && volume !== undefined) {
      window.localStorage.setItem('live-mute', String(isMuted));
    }
  }, [isMuted, volume, props.videoRef, props.isLive, forceMuteFirst]);

  useEffect(() => {
    if (forceMuteFirst === undefined) {
      return;
    }

    const mute = window.localStorage.getItem('live-mute') || 'false';
    const volume = window.localStorage.getItem('live-volume') || '100';

    if (mute || forceMuteFirst) {
      setIsMuted(forceMuteFirst || mute === 'true');
    }
    if (volume) {
      setVolume(Number(volume));
    }
  }, [forceMuteFirst]);

  return (
    <Fade in={props.show}>
      <Container>
        {!isLive && (
          <Flex
            minWidth="max-content"
            alignItems="center"
            gap="2"
            p={2}
            paddingBottom={0}
          >
            <Slider
              aria-label="seek"
              value={(props.seek / props.videoSeconds) * 100}
              onChange={e => props.onSeek((e / 100) * props.videoSeconds)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Flex>
        )}

        <Flex
          minWidth="max-content"
          alignItems="center"
          gap="2"
          p={2}
          paddingTop={isLive ? 1 : 2}
        >
          {isLive ? (
            <Fragment>
              <Tooltip
                label={intl.formatMessage({ id: 'live.player.seek-latest' })}
              >
                <Button variant="ghost" onClick={props.onLive} size="sm">
                  {props.latency === -1
                    ? 'BUFFERING'
                    : `LIVE (${props.latency}s)`}
                </Button>
              </Tooltip>

              <Tooltip label={intl.formatMessage({ id: 'live.player.reload' })}>
                <Button variant="ghost" onClick={props.onReload} size="sm">
                  <FiRefreshCw />
                </Button>
              </Tooltip>
            </Fragment>
          ) : (
            <Button
              variant="ghost"
              onClick={props.isPlaying ? props.onPause : props.onPlay}
              size="sm"
            >
              {props.isPlaying ? <FiPause /> : <FiPlay />}
            </Button>
          )}

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

          {!isLive && (
            <Button variant="ghost" size="sm" fontWeight="normal">
              {formatSeconds(props.seek)} / {formatSeconds(props.videoSeconds)}
            </Button>
          )}

          <Spacer />

          {isLive && (
            <Tooltip label={intl.formatMessage({ id: 'live.player.danmaku' })}>
              <Button variant="ghost" onClick={props.onChangeDanmaku} size="sm">
                <FiMessageCircle />
              </Button>
            </Tooltip>
          )}

          {props.playType && (
            <Menu>
              <MenuButton as={Button} variant="ghost" size="sm">
                <FormattedMessage
                  id={`${isLive ? 'live' : 'video'}.player.settings.type.${
                    props.playType
                  }.title`}
                />
              </MenuButton>

              <Portal>
                <MenuList zIndex={99999}>
                  <MenuOptionGroup
                    title={intl.formatMessage({
                      id: 'live.player.settings.type'
                    })}
                    value={props.playType}
                    onChange={e =>
                      isLive
                        ? props.onChangePlayType(e as LivePlayType)
                        : props.onChangePlayType(e as VideoPlayType)
                    }
                    type="radio"
                  >
                    {(isLive ? livePlayTypes : videoPlayTypes).map(playType => (
                      <MenuItemOption value={playType.id} key={playType.id}>
                        <FormattedMessage
                          id={`${
                            isLive ? 'live' : 'video'
                          }.player.settings.type.${playType.id}.title`}
                        />

                        {playType.badge && (
                          <Badge ml="1" mb="1">
                            {playType.badge}
                          </Badge>
                        )}

                        <Text fontSize="xs" color="gray.500">
                          <FormattedMessage
                            id={`${
                              isLive ? 'live' : 'video'
                            }.player.settings.type.${playType.id}.note`}
                          />
                        </Text>
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                </MenuList>
              </Portal>
            </Menu>
          )}

          {isDesktop && props.onToggleContainerSize && (
            <Tooltip label={intl.formatMessage({ id: 'live.player.wide' })}>
              <Button
                variant="ghost"
                size="sm"
                onClick={props.onToggleContainerSize}
              >
                <FiChevronsUp />
              </Button>
            </Tooltip>
          )}

          <Tooltip label={intl.formatMessage({ id: 'live.player.maximize' })}>
            <Button variant="ghost" size="sm" onClick={props.onToggleMaximize}>
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

const livePlayTypes: { id: LivePlayType; badge?: string }[] = [
  {
    id: LivePlayType.FlvWs,
    badge: 'FLV-WS'
  },
  {
    id: LivePlayType.FlvHttp,
    badge: 'FLV-HTTP'
  },
  {
    id: LivePlayType.HlsHq,
    badge: 'HLS'
  },
  {
    id: LivePlayType.HlsLq,
    badge: 'HLS'
  },
  {
    id: LivePlayType.Audio,
    badge: 'HLS'
  }
];

const videoPlayTypes: { id: VideoPlayType; badge?: string }[] = [
  {
    id: VideoPlayType.HlsHq
  }
];
