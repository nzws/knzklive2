import { AspectRatio, Container, Grid, GridItem } from '@chakra-ui/react';
import { FC, useRef } from 'react';
import { LivePublic } from '~/../server/src/models/live';

type Props = {
  live: LivePublic;
};

export const Live: FC<Props> = ({ live }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Container maxW={{ base: 'container.xl', xl: '100%' }}>
      <Grid
        templateRows="repeat(1, 1fr)"
        templateColumns="repeat(4, 1fr)"
        columnGap={6}
      >
        <GridItem colSpan={3} bg="tomato">
          <AspectRatio ratio={16 / 9}>
            <video controls ref={videoRef} />
          </AspectRatio>
        </GridItem>
        <GridItem colSpan={1} bg="papayawhip">
          a
        </GridItem>
      </Grid>
    </Container>
  );
};
