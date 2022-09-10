import {
  tenantFetcher,
  Props as TenantProps,
  PathProps as TenantPathProps
} from './tenant';
import {
  localeFetcher,
  Props as LocaleProps,
  PathProps as LocalePathProps
} from './locale';
import { getAllStaticProps } from './get-all-static-props';

export type Props = TenantProps & LocaleProps;
export type PathProps = TenantPathProps & LocalePathProps;

export const defaultStaticProps = getAllStaticProps<Props, PathProps>([
  tenantFetcher,
  localeFetcher
]);
