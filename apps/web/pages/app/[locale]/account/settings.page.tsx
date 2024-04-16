import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Link as ChakraLink,
  Code,
  useToast
} from '@chakra-ui/react';
import { FormattedMessage, useIntl } from 'react-intl';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { Navbar } from '~/organisms/navbar';
import { Footer } from '~/organisms/footer';
import { useMyTenants } from '~/utils/hooks/api/use-my-tenant';
import { useMyInviteCodes } from '~/utils/hooks/api/use-my-invite-codes';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { client } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';
import { useUsersMe } from '~/utils/hooks/api/use-users-me';
import { useRouter } from 'next/router';

const Page: NextPage<PageProps<Props, PathProps>> = () => {
  const intl = useIntl();
  const { token } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [me] = useUsersMe();
  const [myTenants, mutateTenants] = useMyTenants();
  const [inviteCodes, mutateInviteCodes] = useMyInviteCodes();
  const alreadyStreamer = (myTenants?.length || 0) > 0;
  const newSlug = (me?.account || '').split('@')[0];

  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);

  const handleCreateInviteCode = useCallback(async () => {
    try {
      if (!token) {
        return;
      }
      setIsLoading(true);

      await client.v1.invites.post({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await mutateInviteCodes();
    } catch (e) {
      console.warn(e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [token, mutateInviteCodes]);

  const handleCreateTenant = useCallback(async () => {
    try {
      if (!token) {
        return;
      }
      setIsLoading(true);

      await client.v1.tenants.post({
        body: {
          inviteCode,
          slug: newSlug
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      await mutateTenants();
      await router.push(`/@${newSlug}/settings`);

      toast({
        title: intl.formatMessage({ id: 'toast.create-tenant.title' }),
        description: intl.formatMessage({
          id: 'toast.create-tenant.description'
        }),
        status: 'success',
        isClosable: true
      });
    } catch (e) {
      console.warn(e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [token, newSlug, inviteCode, toast, intl, router, mutateTenants]);

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>
          {[
            intl.formatMessage({ id: 'page.account-settings.title' }),
            'KnzkLive'
          ].join(' - ')}
        </title>
      </Head>

      <Container py={6} maxW="container.lg">
        <Stack spacing={6}>
          <Heading>
            <FormattedMessage id="page.account-settings.title" />
          </Heading>

          <Stack spacing={4}>
            <Heading size="md">
              <FormattedMessage id="page.account-settings.profile.title" />
            </Heading>

            <Alert status="info">
              <AlertIcon />
              <FormattedMessage id="page.account-settings.profile.note" />
            </Alert>
          </Stack>

          {alreadyStreamer ? (
            <Stack spacing={4}>
              <Heading size="md">
                <FormattedMessage id="page.account-settings.invite.title" />
              </Heading>

              <Text>
                <FormattedMessage id="page.account-settings.invite.note" />
              </Text>

              <Button
                colorScheme="blue"
                onClick={() => void handleCreateInviteCode()}
                isLoading={isLoading}
              >
                <FormattedMessage id="page.account-settings.invite.create" />
              </Button>

              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>
                        <FormattedMessage id="page.account-settings.invite.list.id" />
                      </Th>
                      <Th>
                        <FormattedMessage id="page.account-settings.invite.list.used" />
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {inviteCodes?.map(inviteCode => (
                      <Tr key={inviteCode.inviteId}>
                        <Td>
                          <Code>{inviteCode.inviteId}</Code>
                        </Td>
                        <Td>{inviteCode.usedBy ? 'Yes' : ''}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Heading size="md">
                <FormattedMessage id="page.account-settings.tenant.title" />
              </Heading>

              <Alert status="info">
                <AlertIcon />
                <FormattedMessage id="page.account-settings.tenant.note" />
              </Alert>

              <FormControl>
                <FormLabel>
                  <FormattedMessage id="page.account-settings.tenant.invite-code" />
                </FormLabel>

                <Input
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value)}
                />

                <FormLabel>
                  <FormattedMessage
                    id="page.account-settings.tenant.terms"
                    values={{
                      link: (
                        <ChakraLink
                          href="https://nzws.notion.site/knzk-live-cbc2512a7ced4c80b93536d5ab671d13"
                          isExternal
                        >
                          <FormattedMessage id="page.account-settings.tenant.terms-and-privacy" />
                        </ChakraLink>
                      )
                    }}
                  />
                </FormLabel>

                <Button
                  colorScheme="blue"
                  onClick={() => void handleCreateTenant()}
                  isLoading={isLoading}
                >
                  <FormattedMessage id="page.account-settings.tenant.submit" />
                </Button>
              </FormControl>
            </Stack>
          )}
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
