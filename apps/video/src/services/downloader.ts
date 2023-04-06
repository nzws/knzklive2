import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { ReadableStream } from 'stream/web';

export const download = async (
  downloadUrl: string,
  path: string
): Promise<void> => {
  const response = await fetch(downloadUrl);
  if (!response.ok || !response.body) {
    throw new Error('Download failed');
  }

  const fileStream = createWriteStream(path);
  await finished(
    Readable.fromWeb(response.body as ReadableStream<unknown>).pipe(fileStream)
  );
};
