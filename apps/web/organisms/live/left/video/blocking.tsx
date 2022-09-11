import { Box, Grid, Hide, Image, Text } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  onClick: () => void;
};

export const Blocking: FC<Props> = ({ onClick }) => (
  <Container onClick={onClick}>
    <Box
      bg="pink.500"
      borderRadius={8}
      flexDirection={{ base: 'column', xl: 'row' }}
      maxW="60%"
      width={600}
    >
      <Grid
        gridTemplateColumns={{ base: '1fr', xl: '160px 1fr' }}
        alignItems="end"
        position="relative"
        minH="120px"
      >
        <Hide below="xl">
          <Box>
            <Knzk
              src="/static/surprized_knzk.png"
              alt="Surprized knzk"
              width="160px"
            />
          </Box>
        </Hide>

        <Box p={4}>
          <Text size="md">
            <FormattedMessage id="live.player.autoplay-blocked" />
          </Text>
        </Box>
      </Grid>
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
`;

const Knzk = styled(Image)`
  position: absolute;
  bottom: 0;
`;
