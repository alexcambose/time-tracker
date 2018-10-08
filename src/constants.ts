import { workspace } from 'vscode';
import { TimeType } from './enums';
const config = workspace.getConfiguration('time-tracker');
const {
  shortTimeFormat,
  longTimeFormat,
  breakInterval,
  hourlyRate,
  saveWorkSessionBetweenStartups,
} = config;
export const TIME_FORMAT_LONG: string = shortTimeFormat;
export const TIME_FORMAT_SHORT: string = longTimeFormat;
export const STORAGE_DATE_FORMAT_ID = 'D/M/Y';
export const SHOULD_TAKE_BREAK_INTERVAL = breakInterval;
export const HOURLY_RATE_REGEX = /([0-9]+)\s([A-Za-z]+)/;
export const HOURLY_RATE = hourlyRate;
export const SAVE_WORK_SESSIONS_BETWEEN_STARTUPS = saveWorkSessionBetweenStartups;
// what types of time is considered  a break
export const BREAK_RELATED_WORK_TYPES = [
  TimeType.Break,
  TimeType.WorkSessionStart,
  TimeType.WorkSessionStop,
];
export const SALARY_RELATED_WORK_TYPES = [TimeType.WorkSessionStart];
