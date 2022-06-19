import isValidDomain from 'is-valid-domain';

export const checkDomain = (domain: string): boolean => {
  if (process.env.NODE_ENV === 'development') {
    // ポート
    domain = domain.split(':')[0];

    if (domain === 'localhost') {
      return true;
    }
  }

  return isValidDomain(domain);
};
