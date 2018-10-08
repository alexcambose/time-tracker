import { HOURLY_RATE_REGEX } from './constants';

const hoursBetweenTimestamps = (
  timestamp1: number,
  timestamp2: number
): number => {
  const diff: number = Math.abs(timestamp1 - timestamp2);
  const result = diff / (60 * 60 * 1000);
  return Math.round(result * 100) / 100;
};
export const parseHourlyRate = (hourlyRate: string) => {
  const parsed = HOURLY_RATE_REGEX.exec(hourlyRate);
  if (!parsed || parsed.length < 3) return false;

  return {
    amount: parseInt(parsed[1]),
    currency: parsed[2],
  };
};
export default (
  startedTimestamp: number,
  endTimestamp: number = Date.now(),
  hourlyRate: string
): string => {
  const parsed = parseHourlyRate(hourlyRate);
  if (!parsed) return;

  const { amount, currency } = parsed;

  return (
    hoursBetweenTimestamps(startedTimestamp, endTimestamp) * amount +
    ' ' +
    currency
  );
};
