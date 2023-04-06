import { Alert, AlertIcon, AspectRatio, Center, Flex } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  thumbnailUrl?: string;
  streamerUserId: number;
  messageIntl: string;
};

export const VideoMessageBox: FC<Props> = ({
  thumbnailUrl,
  streamerUserId,
  messageIntl
}) => (
  <Container
    ratio={16 / 9}
    style={{
      backgroundImage: `url(${
        thumbnailUrl || `/api/default-thumbnail.png?userId=${streamerUserId}`
      })`
    }}
  >
    <Inner>
      <Flex>
        <Alert status="info" borderRadius={6}>
          <AlertIcon />
          <FormattedMessage id={messageIntl} />
        </Alert>
      </Flex>
    </Inner>
  </Container>
);

const Container = styled(AspectRatio)`
  background-color: #000;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const Inner = styled(Center)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
`;
