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
import { useStreamStatus } from '~/utils/hooks/api/use-stream-status';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useAuth } from '~/utils/hooks/use-auth';
import { CreateLive } from './create-live';
import { LoginModal } from './login-modal';
import { User } from './user';

type Props = {
  tenant?: TenantPublic;
};

export const Navbar: FC<Props> = ({ tenant }) => {
  const { user } = useAuth();
  const {
    isOpen: isOpenLogin,
    onOpen: onOpenLogin,
    onClose: onCloseLogin
  } = useDisclosure();
  const {
    isOpen: isOpenCreateLive,
    onOpen: onOpenCreateLive,
    onClose: onCloseCreateLive
  } = useDisclosure();
  const [me] = useUsersMe();
  const [status] = useStreamStatus(
    tenant?.ownerId === user?.id ? tenant?.id : undefined
  );

  return (
    <Fragment>
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      {tenant && status && (
        <CreateLive
          isOpen={isOpenCreateLive}
          onClose={onCloseCreateLive}
          recentLive={status?.recently}
          tenant={tenant}
        />
      )}

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
                  <User
                    tenant={tenant}
                    onCreateLive={onOpenCreateLive}
                    recentLive={status?.recently}
                  />
                ) : (
                  <HStack spacing="3">
                    <Button variant="ghost" onClick={onOpenLogin} size="sm">
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
