import { AspectRatio, Image } from '@chakra-ui/react';
import { FC, Fragment } from 'react';
import { NotPushed } from '~/organisms/live/left/video/not-pushed';
import styled from '@emotion/styled';

type Props = {
  thumbnailUrl?: string;
  isPushing?: boolean;
};

export const LivePreview: FC<Props> = ({ thumbnailUrl, isPushing }) => (
  <Fragment>
    {isPushing ? (
      <VideoContainer ratio={16 / 9}>
        <Image
          src={thumbnailUrl}
          style={{
            objectFit: 'contain'
          }}
          alt="image"
        />
      </VideoContainer>
    ) : (
      <NotPushed thumbnailUrl={thumbnailUrl} />
    )}
  </Fragment>
);

const VideoContainer = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;
