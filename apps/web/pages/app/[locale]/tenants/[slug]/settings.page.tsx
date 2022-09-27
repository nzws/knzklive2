import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
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

const Page: NextPage<PageProps<Props, { slug: string } & PathProps>> = ({
  pathProps: { slug }
}) => {
  const { token } = useAuth();
  const [Tenant] = useTenant(slug);
  const [tenant] = useTenantById(Tenant?.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  useAPIError(error);
  const [displayName, setDisplayName] = useState<string>();
  const [autoRedirectInTopPage, setAutoRedirectInTopPage] = useState<boolean>();
  const [exploreInOtherTenants, setExploreInOtherTenants] = useState<boolean>();

  const handleSubmit = useCallback(async () => {
    if (!Tenant?.id) {
      return;
    }

    setIsLoading(true);

    try {
      await client.v1.tenants._tenantId(Tenant?.id).$patch({
        body: {
          displayName,
          config: {
            autoRedirectInTopPage,
            exploreInOtherTenants
          }
        },
        headers: {
          Authorization: `Bearer ${token || ''}`
        }
      });
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
    autoRedirectInTopPage,
    exploreInOtherTenants
  ]);

  useEffect(() => {
    if (!tenant) {
      return;
    }

    setDisplayName(tenant.tenant.displayName || '');
    setAutoRedirectInTopPage(tenant.config.autoRedirectInTopPage);
    setExploreInOtherTenants(tenant.config.exploreInOtherTenants);
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
              <FormLabel>テナント表示名(廃止予定)</FormLabel>

              <Input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />

              <FormHelperText>
                ウェブサイトのタイトルとしてナビゲーション、ページタイトルなどに使用されます。
                記入されていない場合はドメイン名が使用されます。
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>配信者ID</FormLabel>

              <Alert status="info">
                <AlertIcon />
                手動対応が必要なため、詳細は管理者にお問い合わせください。
              </Alert>
            </FormControl>
          </Stack>

          <Divider />

          <Stack spacing={4}>
            <Heading size="md">可視性、見つけやすさの設定</Heading>

            <Alert status="info">
              <AlertIcon />
              公開範囲で「ログインが必要」を設定した配信は、下記の全てが無効になります。
            </Alert>

            <Checkbox
              isChecked={autoRedirectInTopPage}
              onChange={e => setAutoRedirectInTopPage(e.target.checked)}
            >
              配信中の場合、トップページから配信画面に自動でリダイレクトする
            </Checkbox>

            <Checkbox
              isChecked={exploreInOtherTenants}
              onChange={e => setExploreInOtherTenants(e.target.checked)}
            >
              同じプラットフォームの他のページにおすすめとして表示する
            </Checkbox>
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
