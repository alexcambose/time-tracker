import { workspace } from 'vscode';
const config = workspace.getConfiguration('time-tracker');
export const TIME_FORMAT_LONG: string = config.shortTimeFormat;
export const TIME_FORMAT_SHORT: string = config.longTimeFormat;
export const STORAGE_DATE_FORMAT_ID = 'D/M/Y';
export const SHOULD_TAKE_BREAK_INTERVAL = config.breakInterval;
export const HOURLY_RATE_REGEX = /([0-9]+)\s([A-Za-z]+)/;
export const HOURLY_RATE = config.hourlyRate;
