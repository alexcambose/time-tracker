import { TimeType } from './enums';

export interface ITimeBlock {
  type: TimeType;
  startTime: number;
}
export interface ITimeDay {
  date: string;
  data: ITimeBlock;
}
