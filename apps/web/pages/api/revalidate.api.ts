import { NextApiRequest, NextApiResponse } from 'next';
import { webJWT } from '~/utils/serverside-jwt';

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { signature, data } = req.body as {
    data?: {
      paths: string[];
    };
    signature?: string;
  };

  if (!signature || !data) {
    res.status(400).end();
    return;
  }

  const verified = await webJWT.check(signature, JSON.stringify(data));
  if (!verified) {
    res.status(401).end();
    return;
  }

  try {
    await Promise.all(data.paths.map(path => res.revalidate(path)));
  } catch (e) {
    console.warn(e);
  }
  res.status(200).end();
};

export default api;
