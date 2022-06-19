import { mastodonFetcher } from '../fetcher';

type Status = {
  id: string;
};

export const mastodonCreateStatuses = async (
  domain: string,
  token: string,
  status: string
): Promise<Status | undefined> =>
  mastodonFetcher<Status>(domain, '/api/v1/statuses', token, undefined, {
    status
  });
