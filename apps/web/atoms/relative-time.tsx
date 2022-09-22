import { FC, Fragment } from 'react';
import { useRelativeTime } from '~/utils/hooks/use-relative-time';

type Props = {
  date?: Date;
};

export const RelativeTime: FC<Props> = ({ date }) => {
  const text = useRelativeTime(date);

  return <Fragment>{text}</Fragment>;
};
