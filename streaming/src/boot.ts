import { readFile, writeFile } from 'fs/promises';

const parse = (template: string, data: Record<string, string | number>) => {
  const regex = Object.entries(data).map(([key, value]) => ({
    regex: new RegExp(`{{\\s*${key}\\s*}}`, 'g'),
    value
  }));

  return regex.reduce(
    (acc, { regex, value }) => acc.replace(regex, `${value}`),
    template
  );
};

const generator = async (
  file: string,
  data: Record<string, string | number>
) => {
  const template = await readFile(`./support/${file}`, 'utf8');
  const result = parse(template, data);
  await writeFile(`./.mount/${file}`, result, 'utf8');
};

export const generateConfig = async (): Promise<void> => {
  console.log('Generating config...');

  await generator('Caddyfile', {
    domain: 'example.com'
  });
  await generator('srs.conf', {});

  console.log('Config generated!');
};
