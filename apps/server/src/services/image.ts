import sharp from 'sharp';

export const formatImage = async (buffer: Buffer) => {
  const image = sharp(buffer);
  const [metadata, stats] = await Promise.all([
    image.metadata(),
    image.stats()
  ]);

  const extension = stats.isOpaque ? 'png' : 'jpeg';
  const newBuffer = await image
    .resize({
      width: 1920,
      height: 1080,
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat(extension)
    .toBuffer();

  return {
    buffer: newBuffer,
    extension,
    metadata
  };
};
