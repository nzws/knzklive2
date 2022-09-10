import { Center, Spinner } from '@chakra-ui/react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { defaultStaticProps } from '~/utils/data-fetching/default-static-props';
import { useAPIError } from '~/utils/hooks/api/use-api-error';
import { useAuth } from '~/utils/hooks/use-auth';

const Page: NextPage = () => {
  const { signInCallback } = useAuth();
  const [error, setError] = useState<Error>();
  useAPIError(error);
  const { query } = useRouter();

  useEffect(() => {
    const { code } = query;
    if (!code || typeof code !== 'string' || !signInCallback) {
      return;
    }

    void (async () => {
      try {
        await signInCallback(code);
      } catch (e) {
        setError(e as Error);
        return;
      }

      window.close();
    })();
  }, [query, signInCallback]);

  return (
    <Center width="100vw" height="100vh">
      <Spinner size="xl" />
    </Center>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
