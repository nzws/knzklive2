import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  useColorModeValue,
  useDisclosure
} from '@chakra-ui/react';
import { FC, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useAuth } from '~/utils/hooks/use-auth';
import { LoginModal } from './login-modal';

export const Navbar: FC = () => {
  const { signOut } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [me] = useUsersMe();

  return (
    <Fragment>
      <LoginModal isOpen={isOpen} onClose={onClose} />

      <Box
        as="nav"
        bg="bg-surface"
        boxShadow={useColorModeValue('sm', 'sm-dark')}
      >
        <Container py={{ base: '4', lg: '5' }} maxW="container.xl">
          <HStack spacing="10" justify="space-between">
            <div>KnzkLive</div>

            <Flex justify="right" flex="1">
              <HStack spacing="3">
                {me ? (
                  <HStack spacing="3">
                    <Button variant="ghost" onClick={signOut}>
                      <FormattedMessage id="navbar.logout" />
                    </Button>
                  </HStack>
                ) : (
                  <HStack spacing="3">
                    <Button variant="ghost" onClick={onOpen}>
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
