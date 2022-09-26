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
import { FC, Fragment, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePublic, TenantPublic } from 'api-types/common/types';
import { useStreamStatus } from '~/utils/hooks/api/use-stream-status';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useAuth } from '~/utils/hooks/use-auth';
import { LoginModal } from './login-modal';
import { User } from './user';
import { LiveInfoModal } from '../live/admin/live-info-modal';
import { useRouter } from 'next/router';

type Props = {
  tenant?: TenantPublic;
};

export const Navbar: FC<Props> = ({ tenant }) => {
  const { user } = useAuth();
  const router = useRouter();
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

  const handleSubmitted = useCallback(
    (live?: LivePublic, preferMoveTo?: 'broadcast-via-browser') => {
      if (preferMoveTo === 'broadcast-via-browser') {
        void router.push('/stream/via-browser');
      } else {
        if (live) {
          void router.push(`/watch/${live.id}`);
        }
      }
    },
    [router]
  );

  return (
    <Fragment>
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      {tenant && (
        <LiveInfoModal
          isOpen={isOpenCreateLive}
          onClose={onCloseCreateLive}
          onSubmitted={handleSubmitted}
          live={status?.recently}
          tenantId={tenant.id}
          isCreate
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
