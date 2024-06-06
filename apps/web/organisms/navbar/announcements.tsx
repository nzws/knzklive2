import { Alert, CloseButton, Link } from '@chakra-ui/react';
import { Fragment, MouseEvent, useCallback, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { useAnnouncements } from '~/utils/hooks/api/use-announcements';

export const Announcements = () => {
  const [reads, setReads] = useLocalStorage<string[]>(
    'knzklive-announcement-reads',
    []
  );
  const announcements = useAnnouncements();
  const unreadAnnouncements = useMemo(
    () =>
      announcements?.filter(
        announcement => !reads || !reads.includes(announcement.id)
      ),
    [announcements, reads]
  );

  const handleRead = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const id = e.currentTarget.dataset.id;
      if (!id) {
        return;
      }

      setReads(() => {
        if (!reads) {
          return [id];
        }

        return [...reads, id];
      });
    },
    [setReads, reads]
  );

  return (
    <Fragment>
      {unreadAnnouncements?.map(announcement => (
        <Alert status="info" py={2} px={3} key={announcement.id}>
          <Link
            href={announcement.url}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: 'underline' }}
            isTruncated
          >
            {announcement.title}
          </Link>

          <CloseButton
            size="sm"
            ml="auto"
            onClick={handleRead}
            data-id={announcement.id}
          />
        </Alert>
      ))}
    </Fragment>
  );
};
