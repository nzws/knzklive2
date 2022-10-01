import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Checkbox,
  Code,
  Container,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack
} from '@chakra-ui/react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { PageProps } from '~/utils/data-fetching/get-all-static-props';
import {
  Props,
  PathProps,
  defaultStaticProps
} from '~/utils/data-fetching/default-static-props';
import { Navbar } from '~/organisms/navbar';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { Footer } from '~/organisms/footer';
import { FormattedMessage } from 'react-intl';
import { useTenantById } from '~/utils/hooks/api/use-tenant-by-id';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { client } from '~/utils/api/client';
import { useAuth } from '~/utils/hooks/use-auth';
import { useRouter } from 'next/router';
import { getDocsUrl } from '~/utils/constants';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const webhookDocs = getDocsUrl('help/webhook');

const Page: NextPage<PageProps<Props, { slug: string } & PathProps>> = ({
  pathProps: { slug }
}) => {
  const { token } = useAuth();
  const router = useRouter();
  const [Tenant] = useTenant(slug);
  const [tenant] = useTenantById(Tenant?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [displayName, setDisplayName] = useState<string>();
  const [newSlug, setNewSlug] = useState<string>();
  const [exploreInOtherTenants, setExploreInOtherTenants] = useState<boolean>();
  const [webhookUrl, setWebhookUrl] = useState<string>();

  const handleSubmit = useCallback(async () => {
    if (!Tenant?.id) {
      return;
    }

    setIsLoading(true);

    try {
      await client.v1.tenants._tenantId(Tenant?.id).$patch({
        body: {
          displayName,
          slug: newSlug,
          config: {
            exploreInOtherTenants,
            webhookUrl
          }
        },
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });

      if (newSlug && tenant?.tenant.slug !== newSlug) {
        await router.push(`/@${newSlug.toLowerCase()}/settings`);
      }
    } catch (e) {
      console.warn(e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, [
    Tenant?.id,
    token,
    displayName,
    newSlug,
    exploreInOtherTenants,
    webhookUrl,
    tenant?.tenant.slug,
    router
  ]);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setDisplayName(tenant.tenant.displayName || '');
    setNewSlug(tenant.tenant.slug || '');
    setExploreInOtherTenants(tenant.config.exploreInOtherTenants);
    setWebhookUrl(tenant.config.webhookUrl || '');
  }, [tenant]);

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>{['配信に関する設定', 'KnzkLive'].join(' - ')}</title>
      </Head>

      <Container py={6}>
        <Stack spacing={6}>
          <Heading>配信に関する設定</Heading>

          <Alert status="warning">
            <AlertIcon />
            表示名やテーマ設定などはページごとに5分ほどキャッシュされるため、完全に反映されるまでページ読み込み時にちらつくなどの現象が発生する場合があります。
          </Alert>

          <Stack spacing={4}>
            <Heading size="md">基本設定</Heading>

            <FormControl>
              <FormLabel>チャンネル表示名</FormLabel>

              <Input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />

              <FormHelperText>
                配信一覧やチャンネルページに表示されます。
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>チャンネルID</FormLabel>

              <Alert status="warning" mb={4}>
                <AlertIcon />
                チャンネルIDを変更しても、今までの URL
                はリダイレクトされず、他の誰かが取得できるようになります。
              </Alert>

              <Input
                type="text"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
              />

              <FormHelperText>
                英数字が使用できます。配信画面（例: <Code>/@xxx/1</Code>
                ）などで使用されます。
              </FormHelperText>
            </FormControl>
          </Stack>

          <Divider />

          <Stack spacing={4}>
            <Heading size="md">可視性、見つけやすさの設定</Heading>

            <Checkbox
              isChecked={exploreInOtherTenants}
              onChange={e => setExploreInOtherTenants(e.target.checked)}
            >
              トップページや他のページで配信を表示する
            </Checkbox>
          </Stack>

          <Divider />

          <Stack spacing={4}>
            <Heading size="md">高度な設定</Heading>

            <FormControl>
              <FormLabel>Webhook URL</FormLabel>

              <Input
                type="text"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
              />

              <FormHelperText>
                <Link href={webhookDocs} isExternal>
                  Webhook についての詳細
                  <ExternalLinkIcon mx="2px" />
                </Link>
              </FormHelperText>
            </FormControl>
          </Stack>

          <Divider />

          <Stack spacing={4}>
            <Heading size="md">テーマ設定</Heading>

            <Flex>
              <Badge>
                <FormattedMessage id="common.coming-soon" />
              </Badge>
            </Flex>
          </Stack>

          <Divider />

          <Button
            colorScheme="blue"
            onClick={() => void handleSubmit()}
            isLoading={isLoading}
          >
            保存
          </Button>
        </Stack>
      </Container>

      <Footer />
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
