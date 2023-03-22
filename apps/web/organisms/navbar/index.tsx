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
import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { LivePrivate, LivePublic, TenantPublic } from 'api-types/common/types';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { LoginModal } from './login-modal';
import { User } from './user';
import { LiveInfoModal } from '../live/admin/live-info-modal';
import { useRouter } from 'next/router';

export const Navbar: FC = () => {
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
  const [liveCreatingTenant, setLiveCreatingTenant] = useState<
    TenantPublic | undefined
  >();
  const [liveCreatingPrevious, setLiveCreatingPrevious] = useState<
    LivePrivate | undefined
  >();

  const handleOpenCreateLive = useCallback(
    (tenant: TenantPublic, previousLive?: LivePrivate) => {
      setLiveCreatingTenant(tenant);
      setLiveCreatingPrevious(previousLive);
      onOpenCreateLive();
    },
    [onOpenCreateLive]
  );

  const handleSubmitted = useCallback(
    (live?: LivePublic, preferMoveTo?: 'broadcast-via-browser') => {
      const slug = liveCreatingTenant?.slug;
      if (!live || !slug) {
        return;
      }

      if (preferMoveTo === 'broadcast-via-browser') {
        void router.push(`/@${slug}/${live.idInTenant}/broadcast-via-browser`);
      } else {
        void router.push(`/@${slug}/${live.idInTenant}`);
      }
    },
    [router, liveCreatingTenant]
  );

  useEffect(() => {
    if (isOpenCreateLive) {
      return;
    }

    setLiveCreatingPrevious(undefined);
    setLiveCreatingTenant(undefined);
  }, [isOpenCreateLive]);

  return (
    <Fragment>
      <LoginModal isOpen={isOpenLogin} onClose={onCloseLogin} />
      {liveCreatingTenant && (
        <LiveInfoModal
          isOpen={isOpenCreateLive}
          onClose={onCloseCreateLive}
          onSubmitted={handleSubmitted}
          live={liveCreatingPrevious}
          tenantId={liveCreatingTenant?.id}
          isCreate
        />
      )}

      <Box as="nav" bg="gray.900">
        <Container py={{ base: '3' }} maxW="container.xl">
          <HStack spacing="10" justify="space-between">
            <Link href="/">
              <Heading size="md">KnzkLive</Heading>
            </Link>

            <Flex justify="right">
              <HStack spacing="3">
                {me ? (
                  <User onCreateLive={handleOpenCreateLive} />
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
