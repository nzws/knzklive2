export const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secs = Math.floor(seconds - hours * 3600 - minutes * 60);
  return [hours > 0 ? hours : undefined, minutes, secs]
    .filter(v => v !== undefined)
    .map(v => String(v).padStart(2, '0'))
    .join(':');
};
