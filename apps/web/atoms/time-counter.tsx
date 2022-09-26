import { FC, useEffect, useMemo, useState } from 'react';

type Props = {
  dateFrom?: Date | number | string;
  dateTo?: Date | number | string;
};

export const TimeCounter: FC<Props> = ({ dateFrom, dateTo }) => {
  const from = useMemo(
    () => (dateFrom ? new Date(dateFrom) : undefined),
    [dateFrom]
  );
  const to = useMemo(() => (dateTo ? new Date(dateTo) : undefined), [dateTo]);
  const [counter, setCounter] = useState('00:00');

  useEffect(() => {
    if (!from) {
      return;
    }

    const handler = () => {
      const now = to?.getTime() || Date.now();
      const diff = (now - from.getTime()) / 1000;

      const seconds = Math.floor(diff % 60);
      const minutes = Math.floor(diff / 60) % 60;
      const hours = Math.floor(diff / 3600) % 24;

      const minStr = minutes.toString().padStart(2, '0');
      const secStr = seconds.toString().padStart(2, '0');

      if (hours > 0) {
        setCounter(`${hours}:${minStr}:${secStr}`);
      } else {
        setCounter(`${minStr}:${secStr}`);
      }
    };
    const interval = setInterval(handler, 1000);
    handler();

    return () => {
      clearInterval(interval);
      setCounter('00:00');
    };
  }, [from, to]);

  return <>{counter}</>;
};
