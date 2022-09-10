import {
  Box,
  Container,
  Stack,
  Text,
  Link as ChakraLink,
  Divider
} from '@chakra-ui/react';
import Link from 'next/link';
import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

export const Footer: FC = () => (
  <Box marginTop="auto">
    <Container as={Stack} maxW={'7xl'} py={8}>
      <Divider />

      <Stack as={Stack} direction={{ base: 'column', md: 'row' }} spacing={6}>
        <Text color="gray.400">
          Powered by{' '}
          <ChakraLink href="https://github.com/nzws/knzklive2" isExternal>
            KnzkLive
          </ChakraLink>
        </Text>

        <Text color="gray.400">
          <Link href="/about" passHref>
            <a>
              <FormattedMessage id="page.about.title" />
            </a>
          </Link>
        </Text>
      </Stack>
    </Container>
  </Box>
);
