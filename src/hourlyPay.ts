import { HOURLY_PAY_REGEX } from './constants';

const hoursBetweenTimestamps = (
  timestamp1: number,
  timestamp2: number
): number => {
  const diff: number = Math.abs(timestamp1 - timestamp2);
  const result = diff / (60 * 60 * 1000);
  return Math.round(result * 100) / 100;
};
export default (
  startedTimestamp: number,
  endTimestamp: number = Date.now(),
  hourlyPay: string
): string | boolean => {
  const parsed = HOURLY_PAY_REGEX.exec(hourlyPay);
  if (parsed.length < 3) return false;
  const amount: number = parseInt(parsed[1]);
  const currency: string = parsed[2];

  return (
    hoursBetweenTimestamps(startedTimestamp, endTimestamp) * amount +
    ' ' +
    currency
  );
};
