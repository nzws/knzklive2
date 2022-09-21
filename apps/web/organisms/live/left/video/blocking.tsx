import { Box, Text } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  onClick: () => void;
};

export const Blocking: FC<Props> = ({ onClick }) => (
  <Container onClick={onClick}>
    <Box bg="black" borderRadius={8} p={4}>
      <Text size="md" as="b">
        <FormattedMessage id="live.player.autoplay-blocked" />
      </Text>
    </Box>
  </Container>
);

const Container = styled.div`
  position: absolute;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.4);
`;
