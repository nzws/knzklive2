import { readdir, stat } from 'fs/promises';

export const getDirectorySize = async (dir: string) => {
  let size = BigInt(0);
  const files = await readdir(dir);

  for (const file of files) {
    const path = `${dir}/${file}`;
    try {
      const data = await stat(path, { bigint: true });

      if (data.isDirectory()) {
        size += await getDirectorySize(path);
      } else {
        size += data.size;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  return size;
};

export const getQuotaFreeSize = async () => {
  const actual = await getDirectorySize('/home/node/static');
  const quota = BigInt(
    parseInt(process.env.CACHE_DIR_SAFE_QUOTA_GB || '0', 10) *
      1024 *
      1024 *
      1024
  );
  const size = quota - actual;

  return size;
};
