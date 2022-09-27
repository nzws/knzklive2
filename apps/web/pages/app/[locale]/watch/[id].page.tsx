import { NextPage } from 'next';
import Head from 'next/head';
import { Fragment, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { Box, Spinner } from '@chakra-ui/react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import {
  getAllStaticProps,
  PageProps
} from '~/utils/data-fetching/get-all-static-props';
import {
  tenantFetcher,
  Props as TenantProps,
  PathProps as TenantPathProps
} from '~/utils/data-fetching/tenant';
import {
  localeFetcher,
  Props as LocaleProps,
  PathProps as LocalePathProps
} from '~/utils/data-fetching/locale';
import {
  liveFetcher,
  Props as LiveProps,
  PathProps as LivePathProps
} from '~/utils/data-fetching/live';
import { Navbar } from '~/organisms/navbar';
import { useTenant } from '~/utils/hooks/api/use-tenant';
import { useConvertLiveId } from '~/utils/hooks/api/use-convert-live-id';
import { Live } from '~/organisms/live';
import { useLive } from '~/utils/hooks/api/use-live';
import { useUser } from '~/utils/hooks/api/use-user';
import { SensitiveWarning } from '~/organisms/live/sensitive-warning';

type Props = TenantProps & LocaleProps & LiveProps;
type PathProps = TenantPathProps & LocalePathProps & LivePathProps;

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { tenant: tenantFallback, live: liveFallback },
  pathProps: { tenantDomain, id }
}) => {
  const intl = useIntl();
  const [tenant] = useTenant(tenantDomain, tenantFallback);
  const [liveId] = useConvertLiveId(tenantDomain, id, liveFallback);
  const [live] = useLive(liveId, liveFallback);
  const [streamer] = useUser(live?.userId);
  const [isSensitiveAgreed, setIsSensitiveAgreed] = useState(false);

  const handleAgree = useCallback(() => setIsSensitiveAgreed(true), []);

  return (
    <Fragment>
      <Navbar tenant={tenant} />

      <Head>
        <title>
          {[
            live?.title || intl.formatMessage({ id: 'page.live.title' }),
            tenant?.displayName || tenant?.domain
          ].join(' - ')}
        </title>
      </Head>

      {live?.sensitive && (
        <SensitiveWarning
          isOpen={!isSensitiveAgreed}
          onClose={handleAgree}
          title={live?.title}
        />
      )}

      {live && (!live.sensitive || isSensitiveAgreed) ? (
        <Live live={live} streamer={streamer} />
      ) : (
        <Box textAlign="center" py="12">
          <Spinner size="lg" />
        </Box>
      )}
    </Fragment>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = getAllStaticProps<Props, PathProps>([
  tenantFetcher,
  localeFetcher,
  liveFetcher
]);

export default Page;