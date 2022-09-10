import { GetStaticPaths } from 'next';

export const defaultGetStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};
