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
  Collapse,
  useToast
} from '@chakra-ui/react';
import isValidDomain from 'is-valid-domain';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { getDocsUrl } from '~/utils/constants';
import { useAuth } from '~/utils/hooks/use-auth';
import {
  MASTODON_DOMAIN_LS,
  MISSKEY_DOMAIN_LS,
  SignInType
} from '~/utils/contexts/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const mastodonHelpDocs = getDocsUrl('help/mastodon-account-integration');

enum ServerType {
  Mastodon = 'Mastodon',
  Misskey = 'Misskey'
}

const placeholderDomain: Record<ServerType, string> = {
  [ServerType.Mastodon]: 'knzk.me',
  [ServerType.Misskey]: 'misskey.io'
};

export const LoginModal: FC<Props> = ({ isOpen, onClose }) => {
  const { signIn } = useAuth();
  const intl = useIntl();
  const toast = useToast();
  const {
    isOpen: isOpeningSignIn,
    onOpen: onOpenSignIn,
    onClose: onCloseSignIn
  } = useDisclosure();
  const [serverType, setServerType] = useState<ServerType>();
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
      if (!isValidDomain(domain)) {
        toast({
          title: intl.formatMessage({ id: 'auth.toast.invalid-domain' }),
          status: 'error',
          isClosable: true
        });
        return;
      }

      onOpenSignIn();
      if (serverType === ServerType.Mastodon) {
        await signIn(SignInType.Mastodon, domain);
      } else if (serverType === ServerType.Misskey) {
        await signIn(SignInType.Misskey, domain);
      }
      onClose();
    })();
  }, [signIn, domain, onOpenSignIn, serverType, onClose, toast, intl]);

  useEffect(() => {
    if (!isOpen) {
      onCloseSignIn();
    }
  }, [isOpen, onCloseSignIn]);

  useEffect(() => {
    if (serverType === ServerType.Mastodon) {
      const domain = localStorage.getItem(MASTODON_DOMAIN_LS);
      if (domain) {
        setDomain(domain);
      }
    } else if (serverType === ServerType.Misskey) {
      const prev = localStorage.getItem(MISSKEY_DOMAIN_LS);
      if (prev) {
        setDomain(prev);
      }
    }
  }, [serverType]);

  useEffect(() => {
    if (domain) {
      setHasNotDomain(false);
    }
  }, [domain]);

  useEffect(() => {
    setServerType(undefined);
    setDomain('');
    setHasNotDomain(false);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <FormattedMessage id="navbar.login.modal.title" />
        </ModalHeader>
        <ModalCloseButton />

        <Collapse in={!serverType} animateOpacity>
          <ModalBody>
            <Stack spacing={4} align="center" textAlign="center">
              <Text>
                <FormattedMessage id="navbar.login.modal.welcome" />
              </Text>

              <Button
                colorScheme="blue"
                onClick={() => setServerType(ServerType.Mastodon)}
                width="100%"
              >
                Mastodon
              </Button>

              <Button
                colorScheme="blue"
                onClick={() => setServerType(ServerType.Misskey)}
                width="100%"
              >
                Misskey
              </Button>
            </Stack>
          </ModalBody>

          <ModalFooter />
        </Collapse>

        <Collapse in={!!(!isOpeningSignIn && serverType)} animateOpacity>
          <ModalBody>
            <Stack spacing={4}>
              <Text>
                <FormattedMessage
                  id="navbar.login.modal.body"
                  values={{
                    serverType: serverType,
                    placeholderDomain: serverType
                      ? placeholderDomain[serverType]
                      : '?'
                  }}
                />
              </Text>

              <FormControl isInvalid={hasNotDomain}>
                <FormLabel>
                  <FormattedMessage id="navbar.login.modal.domain" />
                </FormLabel>

                <Input
                  placeholder={intl.formatMessage(
                    {
                      id: 'navbar.login.modal.domain.placeholder'
                    },
                    {
                      placeholderDomain: serverType
                        ? placeholderDomain[serverType]
                        : '?'
                    }
                  )}
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                />
              </FormControl>

              <Link href={mastodonHelpDocs} isExternal>
                <Text fontSize="xs">
                  <FormattedMessage
                    id="navbar.login.modal.help"
                    values={{
                      serverType
                    }}
                  />
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

        <Collapse in={!!(isOpeningSignIn && serverType)} animateOpacity>
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
