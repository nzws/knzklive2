import { Box, VStack } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Comment } from '~/organisms/embed/comment/comment';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { defaultStaticProps } from '~/utils/data-fetching/default-static-props';
import { useLiveRealtime } from '~/utils/hooks/api/use-live-realtime';

const Page: NextPage = () => {
  const { query } = useRouter();
  const [viewerToken, setViewerToken] = useState<string>();
  const [liveId, setLiveId] = useState<number>();
  const { comments } = useLiveRealtime(liveId, viewerToken);

  useEffect(() => {
    if (!query) {
      return;
    }

    const { viewerToken, liveId } = query;
    if (!viewerToken || !liveId) {
      return;
    }

    setViewerToken(viewerToken as string);
    setLiveId(Number(liveId));
  }, [query]);

  return (
    <Box>
      <Global styles={GlobalStyle} />

      <VStack spacing={2} p={2} align="stretch" width="100%" overflow="hidden">
        {comments.map(comment => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </VStack>
    </Box>
  );
};

const GlobalStyle = css`
  ::-webkit-scrollbar {
    display: none;
  }

  html,
  body {
    background: transparent;
  }

  p {
    /* credit: https://qiita.com/NoxGit/items/eb0904822c0f0fe97650 */
    text-shadow:
      black 2px 0,
      black -2px 0,
      black 0 -2px,
      black 0 2px,
      black 2px 2px,
      black -2px 2px,
      black 2px -2px,
      black -2px -2px,
      black 1px 2px,
      black -1px 2px,
      black 1px -2px,
      black -1px -2px,
      black 2px 1px,
      black -2px 1px,
      black 2px -1px,
      black -2px -1px;

    font-size: 2.3rem !important;
    line-height: 1 !important;
    color: #fff !important;
  }
`;

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
