import { FC } from 'react';
import { CustomFormatConfig, FormattedTime } from 'react-intl';

type Props = {
  value?: string | number | Date;
} & Intl.DateTimeFormatOptions &
  CustomFormatConfig;

export const formatDateTimeConfig = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
} as const;

export const FormattedDateTime: FC<Props> = ({ value, ...props }) => (
  <FormattedTime
    year="numeric"
    month="long"
    day="2-digit"
    hour="2-digit"
    minute="2-digit"
    value={value}
    {...props}
  />
);
