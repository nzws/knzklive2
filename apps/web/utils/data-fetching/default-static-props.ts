import {
  localeFetcher,
  Props as LocaleProps,
  PathProps as LocalePathProps
} from './locale';
import { getAllStaticProps } from './get-all-static-props';

export type Props = LocaleProps;
export type PathProps = LocalePathProps;

export const defaultStaticProps = getAllStaticProps<Props, PathProps>([
  localeFetcher
]);
