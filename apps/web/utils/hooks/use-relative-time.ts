import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

export const useRelativeTime = (date?: Date, update = true) => {
  const intl = useIntl();
  const [diff, setDiff] = useState(0);

  const sec = useMemo(() => Math.floor(diff / 1000), [diff]);
  const min = useMemo(() => Math.floor(sec / 60), [sec]);
  const hour = useMemo(() => Math.floor(min / 60), [min]);
  const day = useMemo(() => Math.floor(hour / 24), [hour]);

  const text = useMemo(() => {
    if (!date) {
      return null;
    }

    if (min < 1) {
      return intl.formatMessage({
        id: 'common.relative-time.a-few-seconds-ago'
      });
    } else if (hour < 1) {
      return intl.formatRelativeTime(-min, 'minute');
    } else if (day < 1) {
      return intl.formatRelativeTime(-hour, 'hour');
    } else {
      return intl.formatRelativeTime(-day, 'day');
    }
  }, [date, day, hour, intl, min]);

  useEffect(() => {
    if (!date) {
      return;
    }
    const d = new Date(date);

    const handle = () => {
      setDiff(Date.now() - d.getTime());
    };
    handle();

    if (update) {
      const interval = setInterval(handle, 1000 * 60);
      return () => clearInterval(interval);
    }
  }, [date, update]);

  return text;
};
