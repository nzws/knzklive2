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
import { useLivePermissionCheck } from '~/utils/hooks/api/use-live-permission-check';
import { LiveApp } from '~/organisms/live/live-app';
import { useLive } from '~/utils/hooks/api/use-live';
import { useUser } from '~/utils/hooks/api/use-user';
import { SensitiveWarning } from '~/organisms/live/sensitive-warning';
import { RecordingApp } from '~/organisms/live/recording-app';

type Props = LocaleProps & LiveProps;
type PathProps = { slug: string } & LocalePathProps & LivePathProps;

const Page: NextPage<PageProps<Props, PathProps>> = ({
  props: { live: liveFallback, id: liveId, ...permission }
}) => {
  const intl = useIntl();
  const allowed = useLivePermissionCheck(liveId, permission);
  const [live] = useLive(allowed ? liveId : undefined, liveFallback);
  const [streamer] = useUser(live?.userId);
  const [isSensitiveAgreed, setIsSensitiveAgreed] = useState(false);

  const handleAgree = useCallback(() => setIsSensitiveAgreed(true), []);

  return (
    <Fragment>
      <Navbar />

      <Head>
        <title>
          {[
            live?.title || intl.formatMessage({ id: 'page.live.title' }),
            live?.tenant.displayName,
            'KnzkLive'
          ]
            .filter(Boolean)
            .join(' - ')}
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
        live.endedAt && live.isRecording ? (
          <RecordingApp live={live} streamer={streamer} />
        ) : (
          <LiveApp live={live} streamer={streamer} />
        )
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
  localeFetcher,
  liveFetcher
]);

export default Page;
