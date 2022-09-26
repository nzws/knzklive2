import { ChevronDownIcon } from '@chakra-ui/icons';
import { Container, Flex, Heading, Spacer, Center } from '@chakra-ui/react';
import { FC } from 'react';

type Props = {
  onClick: () => void;
  title?: string;
};

export const MobileTitle: FC<Props> = ({ onClick, title }) => (
  <Container>
    <Flex my={4} onClick={onClick}>
      <Heading size="md">{title}</Heading>

      <Spacer />

      <Center w="30px">
        <ChevronDownIcon />
      </Center>
    </Flex>
  </Container>
);
