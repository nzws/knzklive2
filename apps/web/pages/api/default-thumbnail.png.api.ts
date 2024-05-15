import { NextApiRequest, NextApiResponse } from 'next';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { UserPublic } from 'api-types/common/types';
import { client } from '~/utils/api/client';
import path from 'path';

const WIDTH = 1920;
const HEIGHT = 1080;

const AVATAR_SIZE = 512;

const api = async (req: NextApiRequest, res: NextApiResponse) => {
  const userId = parseInt(req.query.userId as string, 10);
  if (!userId || isNaN(userId)) {
    res.status(400).json({ error: 'Invalid userId' });
    return;
  }

  let user: UserPublic;
  try {
    const { body } = await client.v1.users._userId(userId).get();
    user = body;
  } catch (e) {
    console.warn(e);
    res.status(404).json({ error: 'User Not Found' });
    return;
  }

  try {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    const background = await loadImage(
      path.resolve(process.cwd(), './public/static/thumbnail-background.png')
    );
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (user.avatarUrl) {
      const avatar = await loadImage(user.avatarUrl);

      const avatarX = (WIDTH - AVATAR_SIZE) / 2;
      const avatarY = (HEIGHT - AVATAR_SIZE) / 2;

      ctx.beginPath();
      ctx.arc(
        avatarX + AVATAR_SIZE / 2,
        avatarY + AVATAR_SIZE / 2,
        AVATAR_SIZE / 2,
        0,
        2 * Math.PI
      );
      ctx.clip();
      ctx.drawImage(
        avatar,
        0,
        0,
        avatar.width,
        avatar.height,
        avatarX,
        avatarY,
        AVATAR_SIZE,
        AVATAR_SIZE
      );
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(canvas.toBuffer('image/png'));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
};

export default api;
