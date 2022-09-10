import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { defaultGetStaticPaths } from '~/utils/data-fetching/default-static-paths';
import { defaultStaticProps } from '~/utils/data-fetching/default-static-props';
import { useAuth } from '~/utils/hooks/use-auth';

const Page: NextPage = () => {
  const { signInCallback } = useAuth();
  const [errorCode, setErrorCode] = useState('');
  const { query } = useRouter();

  useEffect(() => {
    const { code } = query;
    if (!code || typeof code !== 'string' || !signInCallback) {
      setErrorCode('Invalid code');
      return;
    }

    void (async () => {
      try {
        await signInCallback(code);
      } catch (e) {
        setErrorCode((e as Error).message);
        return;
      }

      window.close();
    })();
  }, [query, signInCallback]);

  return (
    <div>
      <div>Loading...</div>
      <div>{errorCode}</div>
    </div>
  );
};

export const getStaticPaths = defaultGetStaticPaths;
export const getStaticProps = defaultStaticProps;

export default Page;
