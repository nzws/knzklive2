import { GetStaticProps } from 'next';

export type PageProps<
  Props extends Record<string, unknown>,
  PathProps extends Record<string, string>
> = {
  props: Partial<Props>;
  pathProps: PathProps;
};

export const getAllStaticProps = <
  Props extends Record<string, unknown>,
  PathProps extends Record<string, string>
>(
  fetchers: ((pathProps: PathProps) => Promise<Partial<Props> | undefined>)[]
): GetStaticProps<PageProps<Props, PathProps>, PathProps> => {
  return async ({ params }) => {
    if (!params) {
      console.warn('params is undefined');
      return {
        notFound: true
      };
    }

    try {
      const resolves = await Promise.all(fetchers.map(f => f(params)));
      if (resolves.some(r => r === undefined)) {
        return {
          notFound: true,
          revalidate: 5
        };
      }

      const props = resolves.reduce((acc, cur) => ({ ...acc, ...cur }), {});

      return {
        props: {
          pathProps: params,
          props
        },
        revalidate: 300
      };
    } catch (e) {
      console.warn(e);

      return {
        notFound: true,
        revalidate: 5
      };
    }
  };
};
