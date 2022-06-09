import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import Link from 'next/link';
import { FC, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { TenantPublic } from 'server/src/models/tenant';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { LoginModal } from './login-modal';
import { User } from './user';

type Props = {
  tenant?: TenantPublic;
};

export const Navbar: FC<Props> = ({ tenant }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [me] = useUsersMe();

  return (
    <Fragment>
      <LoginModal isOpen={isOpen} onClose={onClose} />

      <Box as="nav" bg="gray.900">
        <Container py={{ base: '3' }} maxW="container.xl">
          <HStack spacing="10" justify="space-between">
            <Link href="/" passHref>
              <a>
                <Heading size="md">
                  {tenant?.displayName || tenant?.domain}
                </Heading>
              </a>
            </Link>

            <Flex justify="right">
              <HStack spacing="3">
                {me ? (
                  <User tenant={tenant} />
                ) : (
                  <HStack spacing="3">
                    <Button variant="ghost" onClick={onOpen} size="sm">
                      <FormattedMessage id="navbar.login" />
                    </Button>
                  </HStack>
                )}
              </HStack>
            </Flex>
          </HStack>
        </Container>
      </Box>
    </Fragment>
  );
};
