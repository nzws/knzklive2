import { FC, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, FormattedRelativeTime } from 'react-intl';

type Props = {
  date?: Date;
};

export const RelativeTime: FC<Props> = ({ date }) => {
  const [diff, setDiff] = useState(0);

  const sec = useMemo(() => Math.floor(diff / 1000), [diff]);
  const min = useMemo(() => Math.floor(sec / 60), [sec]);
  const hour = useMemo(() => Math.floor(min / 60), [min]);
  const day = useMemo(() => Math.floor(hour / 24), [hour]);

  useEffect(() => {
    if (!date) {
      return;
    }
    const d = new Date(date);

    const handle = () => {
      setDiff(Date.now() - d.getTime());
    };
    const interval = setInterval(handle, 1000 * 60);
    handle();

    return () => clearInterval(interval);
  }, [date]);

  if (!date) {
    return null;
  }

  if (min < 1) {
    return <FormattedMessage id="common.relative-time.a-few-seconds-ago" />;
  } else if (hour < 1) {
    return <FormattedRelativeTime value={-min} unit="minute" />;
  } else if (day < 1) {
    return <FormattedRelativeTime value={-hour} unit="hour" />;
  } else {
    return <FormattedRelativeTime value={-day} unit="day" />;
  }
};
