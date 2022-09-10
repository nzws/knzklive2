import { FC, useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  Input,
  FormLabel,
  Stack,
  Text,
  Link,
  useDisclosure,
  Spinner,
  Collapse
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { getDocsUrl } from '~/utils/constants';
import { useAuth } from '~/utils/hooks/use-auth';
import { MASTODON_DOMAIN_LS, SignInType } from '~/utils/contexts/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const mastodonHelpDocs = getDocsUrl('help/mastodon-account-integration');

export const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const { signIn } = useAuth();
  const intl = useIntl();
  const {
    isOpen: isOpeningSignIn,
    onOpen: onOpenSignIn,
    onClose: onCloseSignIn
  } = useDisclosure();
  const [domain, setDomain] = useState('');
  const [hasNotDomain, setHasNotDomain] = useState(false);

  const handleLogin = useCallback(() => {
    void (async () => {
      if (!signIn) {
        return;
      }
      if (!domain) {
        setHasNotDomain(true);
        return;
      }

      onOpenSignIn();
      await signIn(SignInType.Mastodon, domain);
      onClose();
    })();
  }, [onOpenSignIn, onClose, signIn, domain]);

  useEffect(() => {
    if (!isOpen) {
      onCloseSignIn();
    }
  }, [isOpen, onCloseSignIn]);

  useEffect(() => {
    const prev = localStorage.getItem(MASTODON_DOMAIN_LS);
    if (prev) {
      setDomain(prev);
    }
  }, []);

  useEffect(() => {
    if (domain) {
      setHasNotDomain(false);
    }
  }, [domain]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <FormattedMessage id="navbar.login.modal.title" />
        </ModalHeader>
        <ModalCloseButton />

        <Collapse in={!isOpeningSignIn} animateOpacity>
          <ModalBody>
            <Stack spacing={4}>
              <Text>
                <FormattedMessage id="navbar.login.modal.body" />
              </Text>

              <FormControl isInvalid={hasNotDomain}>
                <FormLabel>
                  <FormattedMessage id="navbar.login.modal.domain" />
                </FormLabel>

                <Input
                  placeholder={intl.formatMessage({
                    id: 'navbar.login.modal.domain.placeholder'
                  })}
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                />
              </FormControl>

              <Link href={mastodonHelpDocs} isExternal>
                <Text fontSize="xs">
                  <FormattedMessage id="navbar.login.modal.help" />
                  <ExternalLinkIcon mx="2px" />
                </Text>
              </Link>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleLogin} width="100%">
              <FormattedMessage id="navbar.login" />
            </Button>
          </ModalFooter>
        </Collapse>

        <Collapse in={isOpeningSignIn} animateOpacity>
          <ModalBody>
            <Stack spacing={12} align="center" textAlign="center">
              <Text>
                <FormattedMessage id="navbar.login.modal.continue" />
              </Text>

              <Spinner size="xl" />
            </Stack>
          </ModalBody>

          <ModalFooter />
        </Collapse>
      </ModalContent>
    </Modal>
  );
};
