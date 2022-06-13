import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getV1AuthMastodonToken } from 'utils/api/v1/auth/token';
import { TOKEN_KEY } from 'utils/fetcher';

const Page: NextPage = () => {
  const [errorCode, setErrorCode] = useState('');
  const { query } = useRouter();

  useEffect(() => {
    const { code } = query;
    if (!code || typeof code !== 'string') {
      setErrorCode('missing_code');
      return;
    }

    void (async () => {
      const type = sessionStorage.getItem('login-provider-type');
      if (type === 'mastodon') {
        const domain = sessionStorage.getItem('mastodon-domain');
        if (!domain) {
          setErrorCode('missing_domain');
          return;
        }

        try {
          const data = await getV1AuthMastodonToken({
            code,
            domain
          });

          localStorage.setItem('mastodon-token', data.mastodonToken);
          localStorage.setItem(TOKEN_KEY, data.liveJwt);
        } catch (e) {
          console.warn(e);
          setErrorCode('invalid_code');
        }
      } else {
        setErrorCode('unknown_provider');
        return;
      }
    });
  }, [query]);

  return (
    <div>
      <div>Loading...</div>
      <div>{errorCode}</div>
    </div>
  );
};

export default Page;
