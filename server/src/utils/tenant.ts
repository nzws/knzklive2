export const getTenantDomain = (
  slug: string,
  customDomain: string | null
): string =>
  customDomain || `${slug}.${process.env.DEFAULT_FRONT_DOMAIN || ''}`;
